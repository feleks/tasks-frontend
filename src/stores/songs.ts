import { Map } from 'immutable';
import { SongBrief, SongDetailed, SongID } from '../api/entities';
import { ScreenState } from './screen';
import { create } from 'zustand';
import { apiCall } from '../api/api_call';

interface SongStore {
    songBriefStorage: Map<SongID, SongBrief>;
    songDetailedStorage: Map<SongID, Omit<SongDetailed, keyof SongBrief>>;

    songListScreen: {
        songs: SongID[];
        searchString: string;
        state: ScreenState;
        loadingMore: boolean;
    };

    songsListScreenAddSongs(songs: SongBrief[], replace?: boolean): void;
    songsListScreenGetError(error: string): void;
    songsListScreenStartLoading(replace?: boolean): void;
    songsListScreenSetSearchString(searchString: string | null): void;
}

export const useSongStore = create<SongStore>()((set) => ({
    songBriefStorage: Map(),
    songDetailedStorage: Map(),
    songListScreen: {
        songs: [],
        searchString: '',
        state: {
            status: 'loading'
        },
        loadingMore: false
    },

    songsListScreenAddSongs(songs: SongBrief[], replace = false): void {
        set((state) => {
            const songBriefStorage = state.songBriefStorage.asMutable();
            if (replace) {
                songBriefStorage.clear();
            }

            const newSongsList = replace ? [] : [...state.songListScreen.songs];
            for (const song of songs) {
                songBriefStorage.set(song.id, song);
                newSongsList.push(song.id);
            }

            return {
                songBriefStorage: songBriefStorage.asImmutable(),
                songListScreen: {
                    songs: newSongsList,
                    searchString: state.songListScreen.searchString,
                    state: {
                        status: 'ok'
                    },
                    loadingMore: false
                }
            };
        });
    },
    songsListScreenGetError(error: string): void {
        set((state) => {
            return {
                songListScreen: {
                    songs: state.songListScreen.songs,
                    searchString: state.songListScreen.searchString,
                    state: {
                        status: 'error',
                        error: error
                    },
                    loadingMore: false
                }
            };
        });
    },
    songsListScreenStartLoading(replace = false): void {
        set((state) => {
            if (replace) {
                return {
                    songListScreen: {
                        ...state.songListScreen,
                        state: {
                            status: 'loading'
                        }
                    }
                };
            } else {
                return {
                    songListScreen: {
                        ...state.songListScreen,
                        loadingMore: true
                    }
                };
            }
        });
    },
    songsListScreenSetSearchString(searchString: string): void {
        set((state) => {
            return {
                songListScreen: {
                    ...state.songListScreen,
                    searchString: searchString
                }
            };
        });
    }
}));

export async function listSongs(replace: boolean) {
    const songStore = useSongStore.getState();

    songStore.songsListScreenStartLoading(replace);

    try {
        const res = await apiCall('/frontend/list_songs', null);

        songStore.songsListScreenAddSongs(res, replace);
    } catch (e) {
        songStore.songsListScreenGetError(`${e}`);
        throw e;
    }
}
