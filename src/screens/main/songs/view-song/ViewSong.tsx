import React, { useLayoutEffect, useState } from 'react';
import './ViewSong.scss';
import { faChevronLeft, faExclamation, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../../../components/button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { PayloadScreenState } from '../../../../stores/screen';
import { apiCall } from '../../../../api/api_call';
import { SongDetailed } from '../../../../api/entities';
import { ApiError } from '../../../../api/errors';
import { SongExplorer } from './song-explorer/SongExplorer';

export function ViewSong() {
    const { id: idRaw } = useParams<{ id: string }>();
    const songID = parseInt(idRaw ?? '0');
    const navigate = useNavigate();
    const [screenState, setScreenState] = useState<PayloadScreenState<SongDetailed>>({ status: 'loading' });

    async function getSong() {
        setScreenState({ status: 'loading' });
        try {
            const song = await apiCall('/frontend/get_song', { id: songID });
            setScreenState({
                status: 'ok',
                payload: song
            });
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

    useLayoutEffect(() => {
        getSong();
    }, [songID]);

    let title: any = null;
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
        title = (
            <span className="screen-view-song-top-panel-loading">
                <FontAwesomeIcon className="spinner" icon={faSpinner} /> Загрузка песни
            </span>
        );
    } else {
        const song = screenState.payload;

        title = (
            <span
                className="screen-view-song-top-panel-back"
                onClick={() => {
                    navigate('/songs');
                }}
            >
                <FontAwesomeIcon icon={faChevronLeft} /> {song == null ? 'Назад' : song.name}
            </span>
        );

        if (screenState.status === 'error' || song == null) {
            const text = screenState.error ?? 'Неизвестная ошибка';
            content = (
                <div className="screen-view-song-content-error">
                    <FontAwesomeIcon icon={faExclamation} className="screen-view-song-content-error-icon" />
                    <div className="screen-view-song-content-error-text">Не удалось запросить песню: {text}</div>
                    <Button
                        className="screen-view-song-content-error-reload"
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
            content = (
                <SongExplorer
                    song={song}
                    setError={(err) => {
                        setScreenState({
                            status: 'error',
                            error: err
                        });
                    }}
                />
            );
        }
    }

    return (
        <div className="screen-view-song segment">
            <div className="screen-view-song-top-panel">{title}</div>
            <div className="screen-view-song-content">{content}</div>
        </div>
    );
}
