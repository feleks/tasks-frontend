export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
    ? ElementType
    : never;

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

    const secsNorm = Math.floor(secs);
    const secsStr = leadingZero(secsNorm % 60);
    const minutesStr = leadingZero(secsNorm / 60);

    return `${minutesStr}:${secsStr}`;
}

export function createRatio(numerator: number, denominator: number): number {
    if (denominator == 0) {
        return 0;
    }
    const ratio = numerator / denominator;
    if (ratio < 0) {
        return 0;
    } else if (ratio > 1) {
        return 1;
    }
    return ratio;
}

export class Loop {
    readonly left: number;
    readonly right: number;
    constructor(left: number, right: number) {
        if (left > right) {
            this.left = right;
            this.right = left;
        } else {
            this.left = left;
            this.right = right;
        }
    }

    public isInBounds(time: number): boolean {
        if (time < this.left) {
            return false;
        } else if (time > this.right) {
            return false;
        }
        return true;
    }

    public toSegment(): [number, number] {
        return [this.left, this.right];
    }

    static fromSegment(segment: [number, number]): Loop {
        return new Loop(segment[0], segment[1]);
    }
}
