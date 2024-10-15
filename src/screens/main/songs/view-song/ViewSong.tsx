import React, { useLayoutEffect, useState } from 'react';
import './ViewSong.scss';
import { faChevronLeft, faExclamation, faPenToSquare, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../../../components/button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { PayloadScreenState } from '../../../../stores/screen';
import { apiCall } from '../../../../api/api_call';
import { SongDetailed } from '../../../../api/entities';
import { ApiError } from '../../../../api/errors';
import { SongExplorer } from './song-explorer/SongExplorer';
import classNames from 'classnames';

export function ViewSong() {
    const { id: idRaw } = useParams<{ id: string }>();
    const songID = parseInt(idRaw ?? '0');
    const navigate = useNavigate();
    const [screenState, setScreenState] = useState<PayloadScreenState<SongDetailed>>({ status: 'loading' });
    const [songModal, setSongModal] = useState<boolean>(false);

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
            <>
                <div
                    className="screen-view-song-top-panel-back"
                    onClick={() => {
                        navigate('/songs');
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <div className="screen-view-song-top-panel-back-title">{song == null ? 'Назад' : song.name}</div>
                </div>
                <div className={classNames('screen-view-song-top-panel-settings', { 'in-progress': songModal })}>
                    <Button
                        style="grey"
                        onClick={() => {
                            setSongModal(true);
                        }}
                        value={<FontAwesomeIcon icon={faPenToSquare} />}
                        small
                    />
                    {/* <FontAwesomeIcon icon={faGear} />*/}
                </div>
            </>
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
                    key={song.id}
                    song={song}
                    songModal={songModal}
                    closeSongModal={() => {
                        setSongModal(false);
                    }}
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
