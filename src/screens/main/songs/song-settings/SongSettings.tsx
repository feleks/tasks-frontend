import React, { useLayoutEffect, useState } from 'react';
import './SongSettings.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { PayloadScreenState } from '../../../../stores/screen';
import { SongDetailed } from '../../../../api/entities';
import { apiCall } from '../../../../api/api_call';
import { ApiError } from '../../../../api/errors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCircleExclamation, faRotateRight, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../../components/button/Button';
import { Input } from '../../../../components/input/Input';

export function SongSettings() {
    const navigate = useNavigate();
    const { id: idRaw } = useParams<{ id: string }>();
    const songID = parseInt(idRaw ?? '0');

    const [screenState, setScreenState] = useState<PayloadScreenState<SongDetailed>>({ status: 'loading' });
    const [name, setName] = useState<string>('');
    const [performer, setPerformer] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    async function getSong() {
        setScreenState({ status: 'loading' });
        try {
            const song = await apiCall('/frontend/get_song', { id: songID });
            setScreenState({
                status: 'ok',
                payload: song
            });
            setName(song.name);
            if (song.performer != null) {
                setPerformer(song.performer);
            }
        } catch (e) {
            if (e instanceof ApiError && e.text != null) {
                setScreenState({
                    status: 'error',
                    error: e.text
                });
            } else {
                setScreenState({
                    status: 'error',
                    error: `Не удалось запросить песню с id ${songID}`
                });
            }
        }
    }

    async function updateSong() {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }

    useLayoutEffect(() => {
        getSong();
    }, [songID]);

    let content: any = null;
    if (screenState.status === 'loading') {
        content = (
            <div className="screen-songs-list-loading">
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
            </div>
        );
    } else if (screenState.status == 'error' || screenState.payload == null) {
        content = (
            <div className="segment-error">
                <FontAwesomeIcon icon={faCircleExclamation} className="segment-error-icon" />
                <div className="segment-error-text">Ошибка загрузки данных</div>
                <Button
                    className="segment-error-reload"
                    value={
                        <span>
                            <FontAwesomeIcon icon={faRotateRight} /> Перезагрузить
                        </span>
                    }
                    style="grey"
                    onClick={() => {
                        getSong();
                    }}
                />
            </div>
        );
    } else {
        const song = screenState.payload;

        content = (
            <>
                <div className="segment-title-back">
                    <span
                        onClick={() => {
                            navigate('/songs');
                        }}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} /> Редактирование песни {song.name}
                    </span>
                </div>
                <form
                    className="screen-add-song-form"
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
                    {deleteConfirm == null ? (
                        <Button
                            className="delete-song"
                            style="red"
                            submit
                            value={
                                <span>
                                    <FontAwesomeIcon icon={faTrashCan} /> Удалить
                                </span>
                            }
                            loading={loading}
                            onClick={() => {
                                setDeleteConfirm(1);
                            }}
                        />
                    ) : (
                        <Button
                            className="delete-song"
                            style="red"
                            submit
                            value={
                                <span>
                                    <FontAwesomeIcon icon={faTrashCan} /> {5 - deleteConfirm} нажатий до удаления
                                </span>
                            }
                            loading={loading}
                            onClick={() => {
                                setDeleteConfirm(deleteConfirm + 1);
                            }}
                        />
                    )}
                </form>
            </>
        );
    }

    return <div className="screen-song-settings segment">{content}</div>;
}
