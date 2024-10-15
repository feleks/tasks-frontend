import { Dispatch, RefObject, SetStateAction } from 'react';
import { secondsToStr } from './utils';

interface Props {
    playerRef: RefObject<HTMLDivElement>;
    playerBorderRef: RefObject<HTMLDivElement>;
    audioRef: RefObject<HTMLAudioElement>;
    audioSourceRef: RefObject<HTMLSourceElement>;
    currentFillRef: RefObject<HTMLDivElement>;
    currentTimeRef: RefObject<HTMLDivElement>;
    pointerFillRef: RefObject<HTMLDivElement>;
    pointerTimeRef: RefObject<HTMLDivElement>;

    setIsPlaying: Dispatch<SetStateAction<boolean>>;
    setCurrentTime: Dispatch<SetStateAction<number>>;
}

export function mountListeners(props: Props): () => void {
    let mounted = true;

    const playerElem = props.playerRef.current;
    const playerBorderElem = props.playerBorderRef.current;
    const audioElem = props.audioRef.current;
    const audioSourceElem = props.audioSourceRef.current;
    const currentFillElem = props.currentFillRef.current;
    const currentTimeElem = props.currentTimeRef.current;
    const pointerFillElem = props.pointerFillRef.current;
    const pointerTimeElem = props.pointerTimeRef.current;

    if (
        playerElem == null ||
        playerBorderElem == null ||
        audioElem == null ||
        audioSourceElem == null ||
        currentFillElem == null ||
        currentTimeElem == null ||
        pointerFillElem == null ||
        pointerTimeElem == null
    ) {
        throw new Error('One of elements is null');
    }

    const updateProgressBar = () => {
        let progressRation = audioElem.currentTime / audioElem.duration;
        if (progressRation > 1) {
            progressRation = 1;
        } else if (progressRation < 0) {
            progressRation = 0;
        } else if (isNaN(progressRation)) {
            progressRation = 0;
        }

        props.setCurrentTime(audioElem.currentTime);

        const progressRationStr = `${(progressRation * 100).toFixed(2)}%`;
        const translate = 5 - 110 * progressRation;
        const timeTransformStr = `translate(${translate.toFixed(2)}%, 0)`;

        currentFillElem.style.width = progressRationStr;
        currentTimeElem.style.left = progressRationStr;
        currentTimeElem.innerText = secondsToStr(audioElem.currentTime);
        currentTimeElem.style.transform = timeTransformStr;
    };

    const startMouseSeek = (mouseEvent: MouseEvent) => {
        const width = playerBorderElem.offsetWidth;
        const startX = mouseEvent.pageX;
        const startXOffset = width * (audioElem.currentTime / audioElem.duration);
        let latestRation: number | null = null;
        const move = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.pageX - startX;
            const endOffset = startXOffset + deltaX;
            let ratio = endOffset / width;
            if (ratio > 1) {
                ratio = 1;
            } else if (ratio < 0) {
                ratio = 0;
            } else if (isNaN(ratio)) {
                ratio = 0;
            }
            if (latestRation == null) {
                pointerFillElem.style.opacity = '0.3';
                pointerTimeElem.style.opacity = '1';
            }
            latestRation = ratio;

            const rationStr = `${(ratio * 100).toFixed(2)}%`;
            const translate = 5 - 110 * ratio;
            const timeTransformStr = `translate(${translate.toFixed(2)}%, 0)`;
            pointerFillElem.style.width = rationStr;
            pointerTimeElem.style.left = rationStr;
            pointerTimeElem.innerText = secondsToStr(ratio * audioElem.duration);
            pointerTimeElem.style.transform = timeTransformStr;
        };
        const up = (e: MouseEvent) => {
            document.body.removeEventListener('mousemove', move);
            document.body.removeEventListener('mouseup', up);
            document.body.removeEventListener('mouseleave', up);
            pointerFillElem.style.opacity = '0';
            pointerTimeElem.style.opacity = '0';
            if (latestRation != null) {
                audioElem.currentTime = audioElem.duration * latestRation;
            }
        };

        document.body.addEventListener('mousemove', move);
        document.body.addEventListener('mouseup', up);
        document.body.addEventListener('mouseleave', up);
    };

    const startTouchSeek = (touchEvent: TouchEvent) => {
        const width = playerBorderElem.offsetWidth;
        const startX = touchEvent.touches[0].pageX;
        const startXOffset = width * (audioElem.currentTime / audioElem.duration);
        let latestRation: number | null = null;
        const move = (moveEvent: TouchEvent) => {
            const deltaX = moveEvent.touches[0].pageX - startX;
            const endOffset = startXOffset + deltaX;
            let ratio = endOffset / width;
            if (ratio > 1) {
                ratio = 1;
            } else if (ratio < 0) {
                ratio = 0;
            } else if (isNaN(ratio)) {
                ratio = 0;
            }
            if (latestRation == null) {
                pointerFillElem.style.opacity = '0.3';
                pointerTimeElem.style.opacity = '1';
            }
            latestRation = ratio;

            const rationStr = `${(ratio * 100).toFixed(2)}%`;
            const translate = 5 - 110 * ratio;
            const timeTransformStr = `translate(${translate.toFixed(2)}%, 0)`;
            pointerFillElem.style.width = rationStr;
            pointerTimeElem.style.left = rationStr;
            pointerTimeElem.innerText = secondsToStr(ratio * audioElem.duration);
            pointerTimeElem.style.transform = timeTransformStr;
        };
        const up = (e: TouchEvent) => {
            document.body.removeEventListener('touchmove', move);
            document.body.removeEventListener('touchend', up);
            document.body.removeEventListener('touchcancel', up);
            pointerFillElem.style.opacity = '0';
            pointerTimeElem.style.opacity = '0';
            if (latestRation != null) {
                let newCurrentTime = audioElem.duration * latestRation;
                if (newCurrentTime >= audioElem.duration - 0.1) {
                    newCurrentTime = audioElem.duration - 0.1;
                }
                audioElem.currentTime = newCurrentTime;
            }
        };

        document.body.addEventListener('touchmove', move);
        document.body.addEventListener('touchend', up);
        document.body.addEventListener('touchcancel', up);
    };

    const ended = (e: Event) => {
        props.setIsPlaying(false);
    };

    audioElem.addEventListener('timeupdate', updateProgressBar);
    audioElem.addEventListener('ended', ended);
    playerBorderElem.addEventListener('touchstart', startTouchSeek);
    playerBorderElem.addEventListener('mousedown', startMouseSeek);

    // const raf = () => {
    //     if (mounted) {
    //         requestAnimationFrame(raf);
    //     }
    //     const duration = audioElem.duration;
    //     if (duration == null || duration === 0) {
    //         return;
    //     }
    //
    //     let progressRation = audioElem.currentTime / duration;
    //     if (progressRation > 1) {
    //         progressRation = 1;
    //     } else if (progressRation < 0) {
    //         progressRation = 0;
    //     } else if (isNaN(progressRation)) {
    //         progressRation = 0;
    //     }
    //
    //     // console.log(progressRation, `${(progressRation * 100).toFixed(2)}%`);
    //
    //     // currentFillElem.style.width = `${(progressRation * 100).toFixed(2)}%`;
    // };
    // raf();

    return () => {
        mounted = false;
        console.log(mounted);

        audioElem.removeEventListener('timeupdate', updateProgressBar);
        audioElem.removeEventListener('ended', ended);
        playerBorderElem.removeEventListener('touchstart', startTouchSeek);

        return;
    };
}
