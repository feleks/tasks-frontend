import { Dispatch, RefObject, SetStateAction } from 'react';
import { SongBrief, SongID } from '../../../../../api/entities';

function waitForAudio(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('wait for audio timeout!'));
        }, 3000);

        const cb = () => {
            audio.removeEventListener('canplaythrough', cb);
            resolve();
        };
        audio.addEventListener('canplaythrough', cb);
    });
}

interface InitPlayer1CacheItem {
    blob: Blob;
    blobOU: string;
    contentType: string;
    createdAt: number;
}
const initPlayer1Cache = new Map<SongID, InitPlayer1CacheItem>();

setInterval(() => {
    const itemsToDelete: SongID[] = [];

    initPlayer1Cache.forEach((item, songID) => {
        const timeElapsed = Date.now() - item.createdAt;

        if (timeElapsed > 15000) {
            itemsToDelete.push(songID);
        }
    });

    for (const songID of itemsToDelete) {
        console.log(`deleted ${songID} from cache`);
        initPlayer1Cache.delete(songID);
    }
}, 1000);
export async function initPlayer(
    song: SongBrief,
    audioRef: RefObject<HTMLAudioElement>,
    audioSourceRef: RefObject<HTMLSourceElement>,
    setLoadingText: Dispatch<SetStateAction<string>>
) {
    const audioElem = audioRef.current;
    const audioSourceElem = audioSourceRef.current;
    if (audioElem == null || audioSourceElem == null) {
        throw new Error('audioElem or audioSourceElem is null');
    }

    let audioInfo = null; // initPlayer1Cache.get(song.id);
    if (audioInfo == null) {
        const res = await fetch(`/frontend/download_song/${song.id}`);

        setLoadingText('Обработка файла');
        const blob = await res.blob();
        const blobOU = window.URL.createObjectURL(blob);

        const contentType = res.headers.get('Content-Type');
        if (contentType == null) {
            throw new Error('contentType is null');
        }

        audioInfo = {
            blob,
            blobOU,
            contentType,
            createdAt: Date.now()
        };

        initPlayer1Cache.set(song.id, audioInfo);
    }

    audioSourceElem.setAttribute('src', audioInfo.blobOU);
    audioSourceElem.setAttribute('type', audioInfo.contentType);

    audioElem.load();
    audioElem.volume = 0.4;

    await waitForAudio(audioElem);
}

export async function initPlayer2(
    song: SongBrief,
    audioRef: RefObject<HTMLAudioElement>,
    audioSourceRef: RefObject<HTMLSourceElement>
) {
    const audioElem = audioRef.current;
    const audioSourceElem = audioSourceRef.current;
    if (audioElem == null || audioSourceElem == null) {
        throw new Error('audioElem or audioSourceElem is null');
    }

    audioSourceElem.setAttribute('src', `/frontend/download_song/${song.id}`);

    audioElem.load();
    audioElem.volume = 0.4;

    await waitForAudio(audioElem);
}
