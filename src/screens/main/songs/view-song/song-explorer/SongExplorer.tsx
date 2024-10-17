import React, { RefObject, useEffect, useRef, useState } from 'react';
import './SongExplorer.scss';
import { SongAction, SongDetailed } from '../../../../../api/entities';
import { Button } from '../../../../../components/button/Button';
import {
    faLocationDot,
    faPause,
    faPencil,
    faPlay,
    faRecycle,
    faStop,
    faTimes,
    faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { mountListeners } from './mountListeners';
import { ArrayElement, Loop, secondsToStr } from './utils';
import { apiCall } from '../../../../../api/api_call';
import moment from 'moment';
import { SegmentLoading } from '../../../../../components/segment-loading/SegmentLoading';
import { AudioProgressBar } from '../../../../../components/audio-progress-bar/AudioProgressBar';
import { initPlayer } from './initPlayer';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../../../../stores/notification';
import { Input } from '../../../../../components/input/Input';

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

const splitOptions = ['drums', 'bass', 'piano', 'vocals', 'other'] as const;
type SplitOption = ArrayElement<typeof splitOptions>;
type SplitRefs = {
    // eslint-disable-next-line no-unused-vars
    [T in SplitOption]: {
        audio: RefObject<HTMLAudioElement>;
        source: RefObject<HTMLSourceElement>;
    };
};
export function SongExplorer(props: Props) {
    console.log('SongExplorerRender', Math.floor(new Date().valueOf() / 10) % 10000);

    const { song, setError } = props;

    const [loadingText, setLoadingText] = useState('Загрузка аудиофайла');
    const [selectedSpeed, setSelectedSpeed] = useState(100);
    const [loopStart, setLoopStart] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [selectedLoopID, setSelectedLoopID] = useState<number | null>(null);
    const [createLoopLoading, setCreateLoopLoading] = useState(false);
    const [createPointLoading, setCreatePointLoading] = useState(false);
    // const [temporaryLoop, setTemporaryLoop] = useState<[number, number] | null>(null);
    const [modal, setModal] = useState<modal | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);
    const audioSourceRef = useRef<HTMLSourceElement>(null);
    const splitRefs: SplitRefs = (() => {
        const res: SplitRefs = {} as any;
        for (const opt of splitOptions) {
            res[opt] = {
                audio: useRef<HTMLAudioElement>(null),
                source: useRef<HTMLSourceElement>(null)
            };
        }
        return res;
    })();

    let selectedLoop: SongAction | null = null;
    if (selectedLoopID != null) {
        for (const action of song.actions) {
            if (action.id == selectedLoopID) {
                selectedLoop = action;
                break;
            }
        }
    }

    let loop: Loop | null = null;
    if (selectedLoop != null && selectedLoop.loop != null) {
        loop = Loop.fromSegment(selectedLoop.loop);
    }

    useEffect(() => {
        localInitPlayer();
        return mountListeners({
            audioElem: audioRef.current,
            setIsPlaying,
            setCurrentTime
        });
    }, []);
    useEffect(() => {
        if (props.songModal) {
            setModal({ type: 'update_song', song });
        } else {
            setModal(null);
        }
    }, [props.songModal]);

    useEffect(() => {
        if (loop != null && !loop.isInBounds(currentTime)) {
            (audioRef.current as any).currentTime = loop.left;
        }
    }, [currentTime, loop]);

    async function localInitPlayer() {
        try {
            await initPlayer(song, audioRef, audioSourceRef, setLoadingText);
            // await initPlayer2(song, audioRef, audioSourceRef);
            if (audioRef.current == null) {
                throw new Error('Нет элемента аудеоплеера');
            }
            if (audioRef.current.duration === 0) {
                throw new Error('Песня имеет нулеваю длину');
            }
            setDuration(audioRef.current.duration);
        } catch (e) {
            setError(`Не удалось инициализировать аудиоплеер ${e}`);
            throw e;
        }
    }

    async function togglePlay() {
        try {
            if (isPlaying) {
                audioRef.current?.pause();
            } else {
                await audioRef.current?.play();
            }
        } catch (e) {
            setError(`Не удалось переключить проигрывание`);
        }
    }

    const createLoop = async () => {
        if (loopStart == null || createLoopLoading) {
            return;
        }

        setCreateLoopLoading(true);

        try {
            setLoopStart(null);

            const loop = new Loop(loopStart, currentTime);
            const action = await apiCall('/frontend/create_action', {
                song_id: song.id,
                type: 'loop',
                loop: loop.toSegment()
            });
            song.actions = [action, ...song.actions];
            setSelectedLoopID(action.id);
        } finally {
            setCreateLoopLoading(false);
        }
    };

    const createPoint = async () => {
        if (createPointLoading) {
            return;
        }

        setCreatePointLoading(true);

        try {
            if (audioRef.current == null) {
                throw new Error('audio ref can not be empty');
            }
            const action = await apiCall('/frontend/create_action', {
                song_id: song.id,
                type: 'point',
                point: audioRef.current.currentTime
            });
            song.actions = [action, ...song.actions];
        } finally {
            setCreatePointLoading(false);
        }
    };

    return (
        <div className="song-explorer">
            {duration === 0 ? <SegmentLoading text={loadingText} overlay={true} /> : null}
            {modal != null ? (
                <Modal
                    {...modal}
                    close={() => {
                        setModal(null);
                        if (modal?.type === 'update_song') {
                            props.closeSongModal();
                        }
                    }}
                    deleteAction={(songID) => {
                        song.actions = [...song.actions].filter((action) => {
                            return action.id != songID;
                        });
                        if (selectedLoopID == songID) {
                            setSelectedLoopID(null);
                        }
                    }}
                />
            ) : null}
            <div className="song-explorer-fixed">
                <audio ref={audioRef} controls>
                    <source ref={audioSourceRef} />
                </audio>
                {splitOptions.map((splitOption) => {
                    return (
                        <audio key={splitOption} ref={splitRefs[splitOption].audio} controls>
                            <source ref={splitRefs[splitOption].source} />
                        </audio>
                    );
                })}

                <AudioProgressBar
                    duration={duration}
                    currentTime={currentTime}
                    points={[]}
                    loop={loop}
                    loopStart={loopStart}
                    onSeek={(time) => {
                        if (audioRef.current != null) {
                            audioRef.current.currentTime = time;
                        }
                    }}
                />
                <div className="song-explorer-controls">
                    {isPlaying ? (
                        <Button
                            className="song-explorer-player-controls-play pause"
                            value={<FontAwesomeIcon icon={faPause} />}
                            style="grey"
                            onClick={() => {
                                togglePlay();
                            }}
                        />
                    ) : (
                        <Button
                            className="song-explorer-player-controls-play resume"
                            value={<FontAwesomeIcon icon={faPlay} />}
                            onClick={() => {
                                togglePlay();
                            }}
                            style="grey"
                        />
                    )}
                    {loop != null ? (
                        <div className="song-explorer-player-controls-loop">
                            <div className="loop-segment">
                                <span className="loop-segment-val">{secondsToStr(loop.left)}</span>
                                <span className="loop-segment-sep">-</span>
                                <span className="loop-segment-val">{secondsToStr(loop.right)}</span>
                            </div>
                            <div
                                className="stop-loop"
                                onClick={() => {
                                    setSelectedLoopID(null);
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </div>
                        </div>
                    ) : null}
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
                                        setSelectedSpeed(speed);
                                    }
                                    if (audioRef.current != null) {
                                        audioRef.current.playbackRate = speed / 100;
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
                        onClick={() => {
                            createPoint();
                        }}
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
                                setSelectedLoopID(null);
                                setLoopStart(audioRef.current?.currentTime ?? 0);
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
                            onClick={() => {
                                createLoop();
                            }}
                            style="yellow"
                            small
                        />
                    )}
                </div>
            </div>
            <div className="song-explorer-scroll">
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
                                        setLoopStart(null);
                                        setSelectedLoopID(actionID);
                                    }}
                                    selectPoint={(time: number) => {
                                        if (audioRef.current != null) audioRef.current.currentTime = time;
                                    }}
                                    setModal={setModal}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
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
