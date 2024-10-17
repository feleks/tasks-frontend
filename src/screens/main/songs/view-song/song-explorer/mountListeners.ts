import { Dispatch, SetStateAction } from 'react';

interface Props {
    audioElem: HTMLAudioElement | null;

    setIsPlaying: Dispatch<SetStateAction<boolean>>;
    setCurrentTime: Dispatch<SetStateAction<number>>;
}

export function mountListeners(props: Props): () => void {
    const audioElem = props.audioElem;

    if (audioElem == null) {
        throw new Error('audioElem is null');
    }

    const timeupdate = () => {
        props.setCurrentTime(audioElem.currentTime);
    };

    const ended = (e: Event) => {
        props.setIsPlaying(false);
    };

    const pause = () => {
        props.setIsPlaying(false);
    };

    const play = () => {
        props.setIsPlaying(true);
    };

    audioElem.addEventListener('timeupdate', timeupdate);
    audioElem.addEventListener('ended', ended);
    audioElem.addEventListener('pause', pause);
    audioElem.addEventListener('play', play);

    return () => {
        audioElem.removeEventListener('timeupdate', timeupdate);
        audioElem.removeEventListener('ended', ended);

        return;
    };
}
