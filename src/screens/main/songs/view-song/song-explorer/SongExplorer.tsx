import React, { createRef, RefObject, useEffect, useRef, useState } from 'react';
import './SongExplorer.scss';
import { SongAction, SongDetailed } from '../../../../../api/entities';
import { Button } from '../../../../../components/button/Button';
import {
    faCodeFork,
    faLocationDot,
    faPause,
    faPencil,
    faPlay,
    faRecycle,
    faSpinner,
    faStop,
    faTimes,
    faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ArrayElement, Loop, secondsToStr } from './utils';
import { apiCall } from '../../../../../api/api_call';
import moment from 'moment';
import { SegmentLoading } from '../../../../../components/segment-loading/SegmentLoading';
import { AudioProgressBar } from '../../../../../components/audio-progress-bar/AudioProgressBar';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../../../../stores/notification';
import { Input } from '../../../../../components/input/Input';
import { AudioVolume } from '../../../../../components/audio-volume/AudioVolume';
import { initPlayer2 } from './initPlayer';

interface Props {
    song: SongDetailed;
    songModal: boolean;

    setError(err: string): void;
    closeSongModal(): void;
}
export interface modal {
    type: 'rename_action' | 'delete_action' | 'update_song';
    song: SongDetailed;
    action?: SongAction;
}
const speedOptions = [80, 85, 90, 95, 100];
interface State {
    modal: modal | null;

    mainVolume: number;
    selectedSpeed: number;
    loopStart: number | null;
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    selectedLoopID: number | null;
    playerStalled: boolean;

    scrollOffset: number;

    test_ShowSubTracks: boolean;
    test_SubTracksVolumes: number[];

    loadingText: string;
    createLoopLoading: boolean;
    createPointLoading: boolean;
}

interface AudioRef {
    audio: React.RefObject<HTMLAudioElement>;
    source: React.RefObject<HTMLSourceElement>;
}

const splitOptions = ['drums', 'bass', 'piano', 'vocals', 'other'] as const;
type SplitOption = ArrayElement<typeof splitOptions>;
type SplitRefs = {
    // eslint-disable-next-line no-unused-vars
    [T in SplitOption]: {
        audio: RefObject<HTMLAudioElement>;
        source: RefObject<HTMLSourceElement>;
    };
};

interface Ref {
    fixed: RefObject<HTMLDivElement>;
    scroll: RefObject<HTMLDivElement>;

    main: AudioRef;
    split: SplitRefs;
}

type Unmounter = () => void;

export class SongExplorer extends React.Component<Props, State> {
    private readonly ref: Ref;
    private unmounters: Unmounter[] = [];
    constructor(props: Props) {
        super(props);

        this.state = {
            modal: null,
            loadingText: 'Загрузка аудиофайла',
            selectedSpeed: 100,
            loopStart: null,
            isPlaying: false,
            duration: 0,
            currentTime: 0,
            test_ShowSubTracks: false,
            test_SubTracksVolumes: [0.33, 0.22, 0.15, 0.17, 0.27],
            selectedLoopID: null,
            createLoopLoading: false,
            createPointLoading: false,
            playerStalled: false,
            scrollOffset: 0,
            mainVolume: 0.3
        };

        this.ref = {
            fixed: createRef(),
            scroll: createRef(),

            main: {
                audio: createRef(),
                source: createRef()
            },
            split: (() => {
                const res: SplitRefs = {} as any;
                for (const opt of splitOptions) {
                    res[opt] = {
                        audio: createRef<HTMLAudioElement>(),
                        source: createRef<HTMLSourceElement>()
                    };
                }
                return res;
            })()
        };
    }

    componentDidMount() {
        this.localInitPlayer();
        this.unmounters.push(this.mountListeners());

        this.updateScrollHeight();
        const id = setInterval(this.updateScrollHeight, 5000);

        this.unmounters.push(() => clearInterval(id));
    }

    componentWillUnmount() {
        for (const unmounter of this.unmounters) {
            unmounter();
        }
    }

    render() {
        // console.log('SongExplorerRender', Math.floor(new Date().valueOf() / 10) % 10000);

        const { song, songModal, closeSongModal } = this.props;
        const {
            modal,
            loadingText,
            selectedSpeed,
            loopStart,
            isPlaying,
            duration,
            currentTime,
            selectedLoopID,
            createLoopLoading,
            createPointLoading,
            playerStalled
        } = this.state;

        let modalParams: modal | null = songModal ? { type: 'update_song', song } : modal;
        if (playerStalled) {
            modalParams = null;
        }
        const selectedLoop = this.getSelectedLoop();

        return (
            <div className={classNames('song-explorer', { 'player-stalled': playerStalled })}>
                {duration === 0 ? <SegmentLoading text={loadingText} overlay={true} /> : null}
                {modalParams != null ? (
                    <Modal
                        {...modalParams}
                        close={() => {
                            this.setState({ modal: null });
                            if (modalParams != null && modalParams.type === 'update_song') {
                                closeSongModal();
                            }
                        }}
                        deleteAction={(songID) => {
                            song.actions = [...song.actions].filter((action) => {
                                return action.id != songID;
                            });
                            if (selectedLoopID == songID) {
                                this.setState({ selectedLoopID: null });
                            }
                        }}
                    />
                ) : null}
                <div className="song-explorer-fixed" ref={this.ref.fixed}>
                    <audio ref={this.ref.main.audio} controls>
                        <source ref={this.ref.main.source} />
                    </audio>
                    {splitOptions.map((splitOption) => {
                        return (
                            <audio key={splitOption} ref={this.ref.split[splitOption].audio} controls>
                                <source ref={this.ref.split[splitOption].source} />
                            </audio>
                        );
                    })}

                    <AudioProgressBar
                        duration={duration}
                        currentTime={currentTime}
                        points={this.getPoints()}
                        loop={selectedLoop?.loop}
                        loopStart={loopStart}
                        onSeek={(time) => {
                            this.audio().currentTime = time;
                        }}
                        stalled={playerStalled}
                    />

                    <div className="song-explorer-controls">
                        <Button
                            className="song-explorer-controls-split"
                            value={
                                <span>
                                    <FontAwesomeIcon icon={faCodeFork} />
                                </span>
                            }
                            style={this.state.test_ShowSubTracks ? 'blue' : 'grey'}
                            small
                            onClick={() => {
                                this.setState({ test_ShowSubTracks: !this.state.test_ShowSubTracks }, this.updateScrollHeight);
                            }}
                        />
                        <div className="song-explorer-controls-playbutton">
                            {(() => {
                                let icon = null;
                                if (isPlaying) {
                                    icon = <FontAwesomeIcon icon={faPause} />;
                                } else {
                                    icon = <FontAwesomeIcon icon={faPlay} />;
                                }

                                return (
                                    <>
                                        <Button
                                            className={classNames('song-explorer-controls-play', {
                                                pause: isPlaying,
                                                resume: !isPlaying
                                            })}
                                            value={icon}
                                            style="grey"
                                            onClick={this.togglePlay}
                                        />
                                        <div
                                            className={classNames('song-explorer-controls-playbutton-overlay', {
                                                show: playerStalled
                                            })}
                                        >
                                            <FontAwesomeIcon className="spinner" icon={faSpinner} />
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        {selectedLoop != null ? (
                            <div className="song-explorer-controls-loop">
                                <div className="loop-segment">
                                    <span className="loop-segment-val">{secondsToStr(selectedLoop.loop.left)}</span>
                                    <span className="loop-segment-sep">-</span>
                                    <span className="loop-segment-val">{secondsToStr(selectedLoop.loop.right)}</span>
                                </div>
                                <div
                                    className="stop-loop"
                                    onClick={() => {
                                        this.setState({ selectedLoopID: null });
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="song-explorer-volume">
                        {!this.state.test_ShowSubTracks ? (
                            <AudioVolume
                                volume={this.state.mainVolume}
                                onVolumeUpdate={(volume) => {
                                    this.audio().volume = volume;
                                }}
                            />
                        ) : (
                            ['Ударные', 'Бас', 'Клавишные', 'Вокал', 'Остальное'].map((name, i) => {
                                return (
                                    <AudioVolume
                                        key={name}
                                        subTrack={{
                                            index: i,
                                            name: name
                                        }}
                                        volume={this.state.test_SubTracksVolumes[i]}
                                        onVolumeUpdate={(volume) => {
                                            const newVolumes = [...this.state.test_SubTracksVolumes];
                                            newVolumes[i] = volume;

                                            this.setState({ test_SubTracksVolumes: newVolumes });
                                            this.audio().volume = volume;
                                        }}
                                    />
                                );
                            })
                        )}
                    </div>
                    <div className="song-explorer-speed">
                        {speedOptions.map((speed) => {
                            const selected = speed === selectedSpeed;
                            return (
                                <div
                                    key={speed}
                                    className={classNames('song-explorer-speed-item component-button small', {
                                        'style-grey': !selected,
                                        'style-blue': selected
                                    })}
                                    onClick={() => {
                                        if (speed != selectedSpeed) {
                                            this.setState({ selectedSpeed: speed });
                                            this.audio().playbackRate = speed / 100;
                                        }
                                    }}
                                >
                                    {speed}%
                                </div>
                            );
                        })}
                    </div>
                    <div className="song-explorer-actions">
                        <Button
                            className="song-explorer-actions-point"
                            loading={createPointLoading}
                            value={
                                <span>
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    Добавить точку
                                </span>
                            }
                            onClick={this.createPoint}
                            style="green"
                            small
                        />
                        {loopStart == null ? (
                            <Button
                                className="song-explorer-actions-loop"
                                loading={createLoopLoading}
                                value={
                                    <span>
                                        <FontAwesomeIcon icon={faRecycle} />
                                        Начать цикл
                                    </span>
                                }
                                onClick={() => {
                                    if (duration == null) {
                                        return;
                                    }
                                    this.setState({ selectedLoopID: null, loopStart: this.audio().currentTime });
                                }}
                                style="yellow"
                                small
                            />
                        ) : (
                            <Button
                                className="song-explorer-actions-loop"
                                loading={createLoopLoading}
                                value={
                                    <>
                                        <span>
                                            <FontAwesomeIcon icon={faStop} /> {secondsToStr(currentTime - loopStart)} Завершить
                                        </span>
                                        {/* <div className="song-explorer-actions-loop-time">01:05</div>*/}
                                    </>
                                }
                                onClick={this.createLoop}
                                style="yellow"
                                small
                            />
                        )}
                    </div>
                </div>
                <div
                    className="song-explorer-scroll"
                    ref={this.ref.scroll}
                    style={{ maxHeight: `calc(100vh - ${this.state.scrollOffset}px)` }}
                >
                    <div className="song-explorer-actions-history">
                        <div className="song-explorer-actions-history-title">Сохраненные действия</div>
                        <div className="song-explorer-actions-history-container">
                            {song.actions.map((action) => {
                                return (
                                    <Action
                                        key={action.id}
                                        song={song}
                                        action={action}
                                        selectedLoopID={selectedLoopID}
                                        selectLoop={(actionID) => {
                                            this.setState({ loopStart: null, selectedLoopID: actionID });
                                        }}
                                        selectPoint={(time: number) => {
                                            this.audio().currentTime = time;
                                        }}
                                        setModal={(modal) => {
                                            this.setState({ modal });
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    audio(): HTMLAudioElement {
        if (this.ref.main.audio.current == null) {
            throw new Error('missing audio element!');
        }
        return this.ref.main.audio.current;
    }

    updateScrollHeight = () => {
        const fixedElem = this.ref.fixed.current;
        const scrollElem = this.ref.scroll.current;
        if (fixedElem == null || scrollElem == null) {
            return;
        }

        const fixedRect = fixedElem.getBoundingClientRect();
        const scrollOffset = fixedRect.top + fixedRect.height + 40;

        if (this.state.scrollOffset != scrollOffset) {
            this.setState({ scrollOffset });
        }
    };
    localInitPlayer = async () => {
        try {
            const audioElem = this.ref.main.audio.current;
            if (audioElem == null) {
                throw new Error('Нет элемента аудеоплеера');
            }
            // await initPlayer(song, audioRef, audioSourceRef, setLoadingText);
            await initPlayer2(this.props.song, this.ref.main.audio, this.ref.main.source);
            if (audioElem.duration === 0) {
                throw new Error('Песня имеет нулеваю длину');
            }

            audioElem.volume = this.state.mainVolume;

            this.setState({ duration: audioElem.duration });
        } catch (e) {
            this.props.setError(`Не удалось инициализировать аудиоплеер`);
            throw e;
        }
    };

    togglePlay = async () => {
        try {
            if (this.state.isPlaying) {
                this.audio().pause();
            } else {
                await this.audio().play();
            }
        } catch (e) {
            this.props.setError(`Не удалось переключить проигрывание`);
        }
    };

    createLoop = async () => {
        const { song } = this.props;
        const { loopStart, createLoopLoading, currentTime } = this.state;

        if (loopStart == null || createLoopLoading) {
            return;
        }

        try {
            this.setState({ createLoopLoading: true, loopStart: null });

            const loop = new Loop(loopStart, currentTime);
            const action = await apiCall('/frontend/create_action', {
                song_id: song.id,
                type: 'loop',
                loop: loop.toSegment()
            });
            song.actions = [action, ...song.actions];
            this.setState({ selectedLoopID: action.id });
        } finally {
            this.setState({ createLoopLoading: false });
        }
    };

    createPoint = async () => {
        const { song } = this.props;
        const { createPointLoading } = this.state;

        if (createPointLoading) {
            return;
        }

        try {
            this.setState({ createPointLoading: true });

            const action = await apiCall('/frontend/create_action', {
                song_id: song.id,
                type: 'point',
                point: this.audio().currentTime
            });
            song.actions = [action, ...song.actions];
        } finally {
            this.setState({ createPointLoading: false });
        }
    };

    getPoints = (): number[] => {
        const res: number[] = [];
        for (const action of this.props.song.actions) {
            if (action.type === 'point' && action.point != null) {
                res.push(action.point);
            }
        }
        return res;
    };

    getSelectedLoop(): { action: SongAction; loop: Loop } | null {
        const { song } = this.props;
        const { selectedLoopID } = this.state;

        if (selectedLoopID == null) {
            return null;
        }

        let selectedLoop: SongAction | null = null;
        for (const action of song.actions) {
            if (action.id == selectedLoopID) {
                selectedLoop = action;
                break;
            }
        }
        if (selectedLoop == null || selectedLoop.loop == null) {
            return null;
        }

        const loop = Loop.fromSegment(selectedLoop.loop);

        return { action: selectedLoop, loop };
    }

    mountListeners = (): (() => void) => {
        const audioElem = this.ref.main.audio.current;
        if (audioElem == null) {
            throw new Error('audioElem is null');
        }

        let mounted = true;

        // const timeupdate = () => {
        //     this.setState({ currentTime: audioElem.currentTime });
        // };

        const ended = (e: Event) => {
            this.setState({ isPlaying: false });
        };

        const pause = () => {
            this.setState({ isPlaying: false });
        };

        const play = () => {
            this.setState({ isPlaying: true });
        };

        const waiting = () => {
            this.setState({ playerStalled: true });
        };

        const playing = () => {
            this.setState({ playerStalled: false, isPlaying: true });
        };

        const volumechange = () => {
            this.setState({ mainVolume: audioElem.volume });
        };

        let prevLoopID: number | null = null;
        const raf = () => {
            if (!mounted) {
                return;
            }

            const selectedLoop = this.getSelectedLoop();
            if (selectedLoop == null && prevLoopID != null) {
                prevLoopID = null;
            }
            if (
                selectedLoop != null &&
                (!selectedLoop.loop.isInBounds(audioElem.currentTime) || prevLoopID !== selectedLoop.action.id)
            ) {
                prevLoopID = selectedLoop.action.id;
                if (Math.abs(audioElem.currentTime - selectedLoop.loop.left) > 0.15) {
                    audioElem.currentTime = selectedLoop.loop.left;
                }
            } else {
                const currentTime = audioElem.currentTime;
                if (Math.abs(this.state.currentTime - currentTime) > 0.15) {
                    this.setState({ currentTime });
                }
            }

            requestAnimationFrame(raf);
        };
        raf();

        // audioElem.addEventListener('timeupdate', timeupdate);
        audioElem.addEventListener('ended', ended);
        audioElem.addEventListener('pause', pause);
        audioElem.addEventListener('play', play);
        audioElem.addEventListener('playing', playing);
        audioElem.addEventListener('waiting', waiting);
        audioElem.addEventListener('volumechange', volumechange);

        // audioElem.addEventListener('loadeddata', (e) => {
        //     console.log('loadeddata', e);
        // });
        // audioElem.addEventListener('loadedmetadata', (e) => {
        //     console.log('loadedmetadata', e);
        // });
        // audioElem.addEventListener('loadstart', (e) => {
        //     console.log('loadstart', e);
        // });
        // audioElem.addEventListener('stalled', (e) => {
        //     console.log('stalled', e);
        // });
        // audioElem.addEventListener('suspend', (e) => {
        //     console.log('suspend', e);
        // });

        return () => {
            mounted = false;
            audioElem.removeEventListener('ended', ended);
            audioElem.removeEventListener('pause', pause);
            audioElem.removeEventListener('play', play);
            audioElem.removeEventListener('playing', playing);
            audioElem.removeEventListener('waiting', waiting);
            audioElem.removeEventListener('volumechange', volumechange);
        };
    };
}

interface ModalProps extends modal {
    close(): void;
    deleteAction(actionID: number): void;
}
function Modal(props: ModalProps) {
    const { action, song } = props;

    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [actionName, setActionName] = useState<string | undefined>(props?.action?.name ?? '');
    const [name, setName] = useState<string>(song.name);
    const [performer, setPerformer] = useState<string>(song.performer ?? '');
    const [deleteConfirmations, setDeleteConfirmations] = useState<number | null>(null);
    const showNotification = useNotificationStore((state) => state.show);

    const focusInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (focusInputRef.current != null) {
            focusInputRef.current.focus();
        }
    }, []);
    const renameAction = async () => {
        if (loading) {
            return;
        }
        if (action == null) {
            throw new Error('action can not be empty');
        }

        try {
            setLoading(true);

            const newName = actionName == '' ? undefined : actionName;

            await apiCall('/frontend/update_action', {
                id: action.id,
                name: newName
            });

            action.name = newName;
        } finally {
            setLoading(false);
            props.close();
        }
    };

    const deleteAction = async () => {
        if (loading) {
            return;
        }
        if (action == null || song == null) {
            throw new Error('action can not be empty');
        }

        try {
            setLoading(true);

            await apiCall('/frontend/delete_action', {
                id: action.id
            });

            props.deleteAction(action.id);
        } finally {
            setLoading(false);
            props.close();
        }
    };

    async function updateSong() {
        if (loading) {
            return;
        }

        if (name.length === 0) {
            return showNotification('error', 'Название не может быть пустым');
        }

        try {
            setLoading(true);

            const newPerformer = performer.length === 0 ? undefined : performer;

            await apiCall('/frontend/update_song', {
                id: song.id,
                name: name,
                performer: newPerformer
            });

            song.name = name;
            song.performer = performer;
        } finally {
            setLoading(false);
            props.close();
        }
    }

    async function deleteSong() {
        if (loading) {
            return;
        }

        try {
            setLoading(true);

            await apiCall('/frontend/delete_song', {
                id: song.id
            });

            navigate('/songs');
        } finally {
            setLoading(false);
            props.close();
        }
    }

    let content = null;
    if (props.type === 'rename_action') {
        if (action == null) {
            throw new Error('action can not be empty');
        }
        content = (
            <form
                className="song-explorer-modal-rename-action"
                onSubmit={(e) => {
                    e.preventDefault();
                    renameAction();
                }}
            >
                <Input
                    inputRef={focusInputRef}
                    label="Название"
                    value={actionName}
                    onChange={(e) => {
                        if (loading) return;
                        setActionName(e.target.value);
                    }}
                />
                <Button submit value="Обновить" loading={loading} />
                <Button
                    className="song-explorer-modal-rename-action-close"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        props.close();
                    }}
                    style="grey"
                    submit
                    value={<FontAwesomeIcon icon={faTimes} />}
                />
            </form>
        );
    } else if (props.type === 'delete_action') {
        if (action == null) {
            throw new Error('action can not be empty');
        }

        let title: string;
        if (action.name == null) {
            title = 'Вы уверены, что хотите удалить сохраненное действие?';
        } else {
            title = `Вы уверены, что хотите удалить действие ${action.name}?`;
        }

        content = (
            <div className="song-explorer-modal-delete-action">
                <h3>{title}</h3>
                <div className="song-explorer-modal-delete-action-buttons">
                    <Button
                        style="red"
                        submit
                        value="Да"
                        loading={loading}
                        onClick={() => {
                            deleteAction();
                        }}
                    />
                    <Button
                        style="grey"
                        submit
                        value="Отмена"
                        onClick={() => {
                            props.close();
                        }}
                    />
                </div>
            </div>
        );
    } else if (props.type === 'update_song') {
        content = (
            <form
                className="song-explorer-modal-update-song"
                onSubmit={(e) => {
                    e.preventDefault();

                    updateSong();
                }}
            >
                <Input
                    inputRef={focusInputRef}
                    label="Название"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                />
                <Input
                    label="Исполнитель"
                    value={performer}
                    onChange={(e) => {
                        setPerformer(e.target.value);
                    }}
                />
                <Button submit value="Обновить" loading={loading} />
                <Button
                    className="song-explorer-modal-rename-action-close"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        props.close();
                    }}
                    style="grey"
                    submit
                    value={<FontAwesomeIcon icon={faTimes} />}
                />
                {deleteConfirmations == null ? (
                    <Button
                        className="delete-song"
                        style="red"
                        submit
                        value={
                            <span>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </span>
                        }
                        loading={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirmations(0);
                        }}
                    />
                ) : (
                    <Button
                        className="delete-song"
                        style="red"
                        submit
                        value={
                            <span>
                                <FontAwesomeIcon icon={faTrashCan} /> {3 - deleteConfirmations}
                            </span>
                        }
                        loading={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (deleteConfirmations >= 2) {
                                deleteSong();
                            } else {
                                setDeleteConfirmations(deleteConfirmations + 1);
                            }
                        }}
                    />
                )}
            </form>
        );
    }

    return <div className="song-explorer-modal">{content}</div>;
}

interface ActionProps {
    song: SongDetailed;
    action: SongAction;
    selectedLoopID: number | null;

    selectLoop(actionID: number | null): void;
    selectPoint(time: number): void;
    setModal(m: modal): void;
}

function Action(props: ActionProps) {
    const { song, action, selectedLoopID, selectLoop, selectPoint, setModal } = props;

    const isLoop = action.type === 'loop';
    const isPoint = action.type === 'point';

    let icon = null;
    let duration = null;
    if (isLoop && action.loop != null) {
        icon = <FontAwesomeIcon icon={faRecycle} className="loop" />;
        duration = (
            <span className="item-duration loop">
                {secondsToStr(action.loop[0])} - {secondsToStr(action.loop[1])}
            </span>
        );
    } else if (isPoint && action.point != null) {
        icon = <FontAwesomeIcon icon={faLocationDot} className="point" />;
        duration = <span className="item-duration point">{secondsToStr(action.point)}</span>;
    }

    const selected = selectedLoopID == action.id;

    return (
        <div
            key={action.id}
            className={classNames(
                'component-button small',
                'style-grey',
                {
                    selected
                },
                'song-explorer-actions-history-item'
            )}
            onClick={() => {
                if (isLoop) {
                    if (!selected) {
                        selectLoop(action.id);
                        // onLoopStart();
                        // setLoopStart(null);
                        // setSelectedLoopID(action.id);
                    } else {
                        selectLoop(null);
                        // setLoopStart(null);
                        // setSelectedLoopID(null);
                    }
                }
                if (isPoint && action.point != null) {
                    selectPoint(action.point);
                    // audioRef.current.currentTime = action.point;
                }
            }}
        >
            {icon}
            {duration}
            {action.name != null ? (
                <span className="item-name">{action.name}</span>
            ) : (
                <span className="item-date">{moment(action.created_at).format('DD.MM.YYYY HH:mm:ss')}</span>
            )}
            <div className="item-controls">
                <div
                    className={classNames('item-rename')}
                    onClick={(e) => {
                        e.stopPropagation();

                        setModal({ type: 'rename_action', action, song });
                    }}
                >
                    <FontAwesomeIcon icon={faPencil} />
                </div>
                <div
                    className={classNames('item-delete')}
                    onClick={(e) => {
                        e.stopPropagation();

                        setModal({ type: 'delete_action', action, song });
                    }}
                >
                    <FontAwesomeIcon icon={faTrashCan} />
                </div>
            </div>
        </div>
    );
}
