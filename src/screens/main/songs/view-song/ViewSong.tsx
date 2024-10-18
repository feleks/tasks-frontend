import React, { useLayoutEffect, useState } from 'react';
import './ViewSong.scss';
import { faChevronLeft, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../../../components/button/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { PayloadScreenState } from '../../../../stores/screen';
import { apiCall } from '../../../../api/api_call';
import { SongDetailed } from '../../../../api/entities';
import { SongExplorer } from './song-explorer/SongExplorer';
import classNames from 'classnames';
import { SegmentError } from '../../../../components/segment-error/SegmentError';
import { SegmentLoading } from '../../../../components/segment-loading/SegmentLoading';

export function ViewSong() {
    const { id: idRaw } = useParams<{ id: string }>();
    const songID = parseInt(idRaw ?? '-1');
    const navigate = useNavigate();
    const [screenState, setScreenState] = useState<PayloadScreenState<SongDetailed>>({ status: 'loading' });
    const [songModal, setSongModal] = useState<boolean>(false);
    const [reloadKey, setReloadKey] = useState<number>(0);

    async function getSong() {
        try {
            setScreenState({ status: 'loading' });

            const song = await apiCall('/frontend/get_song', { id: songID });
            setScreenState({
                status: 'ok',
                payload: song
            });
        } catch (e) {
            setScreenState({
                status: 'error',
                error: `Не удалось запросить иформацию о песне`
            });
        }
    }

    useLayoutEffect(() => {
        getSong();
    }, [songID]);

    let content: any;
    if (screenState.status === 'loading') {
        content = <SegmentLoading text="Загрузка информации о аудиофайле" />;
    } else if (screenState.status === 'error') {
        content = <SegmentError screenState={screenState} reload={getSong} />;
    } else {
        const song = screenState.payload;
        if (song == null) {
            throw new Error('Song can not be null at this point');
        }

        content = (
            <SongExplorer
                key={`${song.id}-${reloadKey}`}
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
                callReload={() => {
                    console.log('Call reload!!!');
                    setReloadKey(reloadKey + 1);
                }}
            />
        );
    }

    return (
        <div className="screen-view-song segment">
            <div className="screen-view-song-top-panel">
                <div
                    className="screen-view-song-top-panel-back"
                    onClick={() => {
                        navigate('/songs');
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <div className="screen-view-song-top-panel-back-title">
                        {screenState.payload == null ? 'Назад' : screenState.payload.name}
                    </div>
                </div>
                {screenState.status !== 'ok' ? null : (
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
                )}
            </div>
            <div className="screen-view-song-content">{content}</div>
        </div>
    );
}
