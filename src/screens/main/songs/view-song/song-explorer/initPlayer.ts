import { RefObject } from 'react';
import { SongID } from '../../../../../api/entities';

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

export async function initPlayer(
    songID: SongID,
    audioRef: RefObject<HTMLAudioElement>,
    audioSourceRef: RefObject<HTMLSourceElement>
) {
    const res = await fetch(`/frontend/download_song/${songID}`);
    const blob = await res.blob();
    const blobOU = window.URL.createObjectURL(blob);

    const audioElem = audioRef.current;
    const audioSourceElem = audioSourceRef.current;
    if (audioElem == null || audioSourceElem == null) {
        throw new Error('audioElem or audioSourceElem is null');
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType == null) {
        throw new Error('contentType is null');
    }

    audioSourceElem.setAttribute('src', blobOU);
    audioSourceElem.setAttribute('type', contentType);

    audioElem.load();
    audioElem.volume = 0.4;

    await waitForAudio(audioElem);
}
