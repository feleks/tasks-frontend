import React, { useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamation, faList, faPlus, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../components/button/Button';
import './Songs.scss';
import { listSongs, useSongStore } from '../../../stores/songs';
import classNames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../../components/input/Input';

export function Songs() {
    const navigate = useNavigate();
    const songListScreen = useSongStore((state) => state.songListScreen);
    const songBriefStorage = useSongStore((state) => state.songBriefStorage);
    const setSearchString = useSongStore((state) => state.songsListScreenSetSearchString);
    const { id: selectedSongIDRaw } = useParams<{ id: string }>();

    useLayoutEffect(() => {
        listSongs(true);
    }, []);

    let content: any = null;

    if (songListScreen.state.status === 'loading') {
        content = (
            <div className="screen-songs-list-loading">
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
                <div className="screen-songs-list-loading-item loading-item" />
            </div>
        );
    } else if (songListScreen.state.status === 'error') {
        content = (
            <div className="screen-songs-list-error">
                <FontAwesomeIcon icon={faExclamation} className="screen-songs-list-error-icon" />
                <div className="screen-songs-list-error-text">
                    Не удалось запросить список песен: {songListScreen.state.error}
                </div>
                <Button
                    className="screen-songs-list-error-reload"
                    value={
                        <span>
                            <FontAwesomeIcon icon={faRotateRight} /> Перезагрузить
                        </span>
                    }
                    style="grey"
                    onClick={() => {
                        listSongs(true);
                    }}
                />
            </div>
        );
    } else if (songListScreen.songs.length === 0) {
        content = (
            <div className="screen-songs-list-empty">
                <FontAwesomeIcon icon={faList} className="screen-songs-list-empty-icon" />
                <div className="screen-songs-list-empty-text">Пока не добавлено ни одной песни :(</div>
            </div>
        );
    } else {
        let filteredSongs = songListScreen.songs;
        let searchString = songListScreen.searchString;

        if (searchString.length > 0) {
            searchString = searchString.toLowerCase();

            filteredSongs = songListScreen.songs.filter((songID) => {
                const song = songBriefStorage.get(songID);
                if (song == null) {
                    throw new Error('Song can not by null at this point');
                }

                const name = song.name.toLowerCase();
                if (name.includes(searchString)) {
                    return true;
                }

                const performer = song.performer == null ? null : song.performer.toLowerCase();
                if (performer != null && performer.includes(searchString)) {
                    return true;
                }
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
            content = filteredSongs.map((songID, i) => {
                const song = songBriefStorage.get(songID);
                if (song == null) {
                    throw new Error('Song can not by null at this point');
                }

                let selected = false;
                if (selectedSongIDRaw != null) {
                    if (parseInt(selectedSongIDRaw) === songID) {
                        selected = true;
                    }
                }

                // <div
                //     className="screen-songs-list-item-settings"
                //     onClick={() => {
                //         navigate(`/songs/${song?.id}`);
                //     }}
                // >
                //     <FontAwesomeIcon icon={faGear} />
                // </div>

                return (
                    <div
                        key={songID}
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
                        </div>
                        {i < songListScreen.songs.length - 1 ? <div className="screen-songs-list-item-separator" /> : null}
                    </div>
                );
            });
        }
    }

    return (
        <div className="screen-songs segment">
            <div className="screen-songs-top-panel">
                <Input
                    className="screen-songs-search-input"
                    label="Поиск"
                    value={songListScreen.searchString}
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
