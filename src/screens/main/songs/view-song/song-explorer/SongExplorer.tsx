import React, { useEffect, useRef, useState } from 'react';
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
import { secondsToStr } from './utils';
import { apiCall } from '../../../../../api/api_call';
import moment from 'moment';
import { initPlayer2 } from './initPlayer';
import { Input } from '../../../../../components/input/Input';
import { useNotificationStore } from '../../../../../stores/notification';
import { useNavigate } from 'react-router-dom';
import { SegmentLoading } from '../../../../../components/segment-loading/SegmentLoading';

interface Props {
    song: SongDetailed;
    songModal: boolean;

    setError(err: string): void;
    closeSongModal(): void;
}

interface modal {
    type: 'rename_action' | 'delete_action' | 'update_song';
    song: SongDetailed;
    action?: SongAction;
}

const speedOptions = [80, 85, 90, 95, 100];
export function SongExplorer(props: Props) {
    const { song, setError } = props;

    const [selectedSpeed, setSelectedSpeed] = useState(100);
    const [loopStart, setLoopStart] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [selectedLoopID, setSelectedLoopID] = useState<number | null>(null);
    const [createLoopLoading, setCreateLoopLoading] = useState(false);
    const [createPointLoading, setCreatePointLoading] = useState(false);
    const [temporaryLoop, setTemporaryLoop] = useState<[number, number] | null>(null);
    // eslint-disable-next-line no-unused-vars
    const [_, rerender] = useState<number>(0);
    const [modal, setModal] = useState<modal | null>(null);

    const playerRef = useRef<HTMLDivElement>(null);
    const playerBorderRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioSourceRef = useRef<HTMLSourceElement>(null);
    const currentFillRef = useRef<HTMLDivElement>(null);
    const currentTimeRef = useRef<HTMLDivElement>(null);
    const pointerFillRef = useRef<HTMLDivElement>(null);
    const pointerTimeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localInitPlayer();
        const unmount = mountListeners({
            playerRef,
            playerBorderRef,
            audioRef,
            audioSourceRef,
            currentFillRef,
            currentTimeRef,
            pointerFillRef,
            pointerTimeRef,

            setIsPlaying,
            setCurrentTime
        });
        return () => {
            unmount();
        };
    }, []);
    useEffect(() => {
        if (props.songModal) {
            setModal({ type: 'update_song', song });
        } else {
            setModal(null);
        }
    }, [props.songModal]);

    async function localInitPlayer() {
        try {
            // await initPlayer(song.id, audioRef, audioSourceRef);
            await initPlayer2(song, audioRef, audioSourceRef);
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
            const newIsPlaying = !isPlaying;
            setIsPlaying(newIsPlaying);

            if (newIsPlaying) {
                await audioRef.current?.play();
            } else {
                audioRef.current?.pause();
            }
        } catch (e) {
            setError(`Не удалось переключить проигрывание`);
        }
    }

    let selectedLoop: SongAction | null = null;
    if (selectedLoopID != null) {
        for (const action of song.actions) {
            if (action.id == selectedLoopID) {
                selectedLoop = action;
                break;
            }
        }
    }

    let loopInActionSegment: [number, number] | null = null;
    if (selectedLoop != null && selectedLoop.loop != null && audioRef.current != null) {
        loopInActionSegment = [selectedLoop.loop[0], selectedLoop.loop[1]];
    } else if (temporaryLoop != null) {
        loopInActionSegment = temporaryLoop;
    }
    if (loopInActionSegment != null && audioRef.current != null) {
        const audioElem = audioRef.current;

        const inBounds = currentTime >= loopInActionSegment[0] && currentTime <= loopInActionSegment[1];
        if (!inBounds) {
            audioElem.currentTime = loopInActionSegment[0];
        }
    }

    let loopViewSegment: [number, number] | null = null;
    if (loopStart != null && duration != null && currentTime != null && playerBorderRef.current != null) {
        loopViewSegment = [loopStart, currentTime];
    } else if (selectedLoop != null && selectedLoop.loop != null) {
        loopViewSegment = [selectedLoop.loop[0], selectedLoop.loop[1]];
    } else if (loopInActionSegment != null) {
        loopViewSegment = [loopInActionSegment[0], loopInActionSegment[1]];
    }

    let loopFill = null;
    if (loopViewSegment != null) {
        if (loopViewSegment[1] < loopViewSegment[0]) {
            loopViewSegment = [loopViewSegment[1], loopViewSegment[0]];
        }

        const left = `${((loopViewSegment[0] / duration) * 100).toFixed(2)}%`;
        const width = `${(((loopViewSegment[1] - loopViewSegment[0]) / duration) * 100).toFixed(2)}%`;

        loopFill = <div className="song-explorer-player-loop-fill" style={{ left, width }} />;
    }

    const createLoop = async () => {
        if (loopStart == null || loopViewSegment == null || createLoopLoading) {
            return;
        }

        setCreateLoopLoading(true);

        try {
            const segment: [number, number] = [loopViewSegment[0], loopViewSegment[1]];
            setLoopStart(null);
            setTemporaryLoop(segment);

            const action = await apiCall('/frontend/create_action', {
                song_id: song.id,
                type: 'loop',
                loop: segment
            });
            song.actions = [action, ...song.actions];
            setSelectedLoopID(action.id);
            setTemporaryLoop(null);
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

    const actionTransformer = (action: SongAction) => {
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
                        // 'style-green': isPoint,
                        // 'style-yellow': isLoop
                    },
                    'song-explorer-actions-history-item'
                )}
                onClick={() => {
                    if (isLoop) {
                        if (!selected) {
                            setLoopStart(null);
                            setSelectedLoopID(action.id);
                        } else {
                            setLoopStart(null);
                            setSelectedLoopID(null);
                        }
                    }
                    if (isPoint && action.point != null && audioRef.current != null) {
                        audioRef.current.currentTime = action.point;
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

                            // const newName = prompt('Введите новое имя');
                            // if (newName != null && newName.length > 0) {
                            //     updateActionName(action.id, newName);
                            // }
                        }}
                    >
                        <FontAwesomeIcon icon={faPencil} />
                        {/* {renameLoading ? (*/}
                        {/*    <FontAwesomeIcon className="spinner" icon={faSpinner} />*/}
                        {/* ) : (*/}
                        {/*    <FontAwesomeIcon icon={faPencil} />*/}
                        {/* )}*/}
                    </div>
                    <div
                        className={classNames('item-delete')}
                        onClick={(e) => {
                            e.stopPropagation();

                            setModal({ type: 'delete_action', action, song });

                            // if (
                            //     confirm(
                            //         `Вы уверены, что хотите удалить действие ${
                            //             action.name ?? moment(action.created_at).format('DD.MM.YYYY HH:mm:ss')
                            //         }`
                            //     )
                            // ) {
                            //     deleteLoop(action.id);
                            // }
                        }}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                        {/* {deleteLoading ? (*/}
                        {/*    <FontAwesomeIcon className="spinner" icon={faSpinner} />*/}
                        {/* ) : (*/}
                        {/*    <FontAwesomeIcon icon={faTrashCan} />*/}
                        {/* )}*/}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="song-explorer">
            {duration === 0 ? <SegmentLoading overlay={true} /> : null}
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
                <div ref={playerRef} className="song-explorer-player">
                    <audio ref={audioRef} controls>
                        <source ref={audioSourceRef} />
                    </audio>
                    <div className="song-explorer-player-duration start">00:00</div>
                    <div className="song-explorer-player-duration end">{secondsToStr(duration)}</div>

                    <div className="song-explorer-player-container">
                        <div ref={playerBorderRef} className="song-explorer-player-border"></div>
                        <div ref={currentFillRef} className="song-explorer-player-current-fill"></div>
                        {song.actions.map((action) => {
                            if (action.type != 'point' || action.point == null || audioRef.current == null) {
                                return;
                            }

                            const leftStr = `${((action.point / audioRef.current.duration) * 100).toFixed(2)}%`;

                            return <div key={action.id} style={{ left: leftStr }} className="song-explorer-player-point"></div>;
                        })}
                        {loopFill}
                        <div ref={currentTimeRef} className="song-explorer-player-current-time"></div>
                        <div ref={pointerFillRef} className="song-explorer-player-pointer-fill"></div>
                        <div ref={pointerTimeRef} className="song-explorer-player-pointer-time"></div>
                    </div>
                </div>
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
                    {loopInActionSegment != null ? (
                        <div className="song-explorer-player-controls-loop">
                            <div className="loop-segment">
                                <span className="loop-segment-val">{secondsToStr(loopInActionSegment[0])}</span>
                                <span className="loop-segment-sep">-</span>
                                <span className="loop-segment-val">{secondsToStr(loopInActionSegment[1])}</span>
                            </div>
                            <div
                                className="stop-loop"
                                onClick={() => {
                                    setSelectedLoopID(null);
                                    setTemporaryLoop(null);
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
                                setTemporaryLoop(null);
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
                    <div className="song-explorer-actions-history-container">{song.actions.map(actionTransformer)}</div>
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
