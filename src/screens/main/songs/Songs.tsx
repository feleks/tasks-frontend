import React, { useLayoutEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../components/button/Button';
import './Songs.scss';
import classNames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../../components/input/Input';
import { PayloadScreenState } from '../../../stores/screen';
import { SongBrief } from '../../../api/entities';
import { apiCall } from '../../../api/api_call';
import { SegmentError } from '../../../components/segment-error/SegmentError';

export function Songs() {
    const navigate = useNavigate();
    const { id: selectedSongIDRaw } = useParams<{ id: string }>();
    const selectedSongID = parseInt(selectedSongIDRaw ?? '-1', 10);
    const [screenState, setScreenState] = useState<PayloadScreenState<SongBrief[]>>({ status: 'loading' });
    const [searchString, setSearchString] = useState('');

    async function listSongs() {
        try {
            setScreenState({ status: 'loading' });

            const songs = await apiCall('/frontend/list_songs', null);
            setScreenState({
                status: 'ok',
                payload: songs.songs
            });
        } catch (e) {
            setScreenState({
                status: 'error',
                error: `Не удалось запросить список песен`
            });
        }
    }

    useLayoutEffect(() => {
        listSongs();
    }, []);

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
    } else if (screenState.status === 'error') {
        content = <SegmentError screenState={screenState} reload={listSongs} />;
    } else if (screenState.payload == null || screenState.payload.length === 0) {
        content = (
            <div className="screen-songs-list-empty">
                <FontAwesomeIcon icon={faList} className="screen-songs-list-empty-icon" />
                <div className="screen-songs-list-empty-text">Пока не добавлено ни одной песни :(</div>
            </div>
        );
    } else {
        let filteredSongs = screenState.payload;

        if (searchString.length > 0) {
            const searchStringNorm = searchString.toLowerCase();

            filteredSongs = screenState.payload.filter((song) => {
                const name = song.name.toLowerCase();
                if (name.includes(searchStringNorm)) {
                    return true;
                }

                const performer = song.performer == null ? null : song.performer.toLowerCase();
                if (performer != null && performer.includes(searchStringNorm)) {
                    return true;
                }

                return false;
            });
        }

        if (filteredSongs.length === 0) {
            content = (
                <div className="screen-songs-list-empty">
                    <FontAwesomeIcon icon={faList} className="screen-songs-list-empty-icon" />
                    <div className="screen-songs-list-empty-text">По данному запросу не найдено ни одной песни</div>
                </div>
            );
        } else {
            content = filteredSongs.map((song, i) => {
                const selected = selectedSongID === song.id;

                return (
                    <div
                        key={song.id}
                        className="screen-songs-list-item-wrapper"
                        onClick={() => {
                            navigate(`/songs/${song?.id}`);
                        }}
                    >
                        <div className={classNames('screen-songs-list-item', { 'selected-item': selected })}>
                            <div
                                className={classNames('screen-songs-list-item-format', { ['song-format-' + song.format]: true })}
                            >
                                {song.format}
                            </div>
                            <div className="screen-songs-list-item-name">{song.name}</div>
                            {song.performer == null ? null : (
                                <div className="screen-songs-list-item-performer">{song.performer}</div>
                            )}
                            {/* <div*/}
                            {/*    className="screen-songs-list-item-settings"*/}
                            {/*    onClick={(e) => {*/}
                            {/*        e.stopPropagation();*/}
                            {/*        navigate(`/songs/settings/${song?.id}`);*/}
                            {/*    }}*/}
                            {/* >*/}
                            {/*    <FontAwesomeIcon icon={faGear} />*/}
                            {/* </div>*/}
                        </div>
                        {i < filteredSongs.length - 1 ? <div className="screen-songs-list-item-separator" /> : null}
                    </div>
                );
            });
        }
    }

    return (
        <div className="screen-songs segment">
            <div className="screen-songs-top-panel">
                <Input
                    icon={faSearch}
                    className="screen-songs-search-input"
                    label="Поиск"
                    value={searchString}
                    onChange={(e) => {
                        setSearchString(e.target.value);
                    }}
                    small
                />
                <Button
                    className="screen-songs-add-button"
                    value={
                        <span>
                            <FontAwesomeIcon icon={faPlus} />
                        </span>
                    }
                    onClick={() => {
                        navigate('/songs/add');
                    }}
                />
            </div>
            <div className="screen-songs-list">{content}</div>
        </div>
    );
}
