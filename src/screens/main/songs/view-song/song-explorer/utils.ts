export function leadingZero(num: number) {
    num = Math.floor(num);
    if (num < 10) {
        return '0' + num.toString();
    }
    return num.toString();
}
export function secondsToStr(secs: number): string {
    if (secs < 0) {
        secs = -secs;
    }

    const secsNorm = Math.ceil(secs);
    const secsStr = leadingZero(secsNorm % 60);
    const minutesStr = leadingZero(secsNorm / 60);

    return `${minutesStr}:${secsStr}`;
}
