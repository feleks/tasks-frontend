import { createRatio, Loop, secondsToStr } from '../../screens/main/songs/view-song/song-explorer/utils';
import React, { createRef } from 'react';
import './AudioProgressBar.scss';
import classNames from 'classnames';

interface Props {
    duration: number;
    currentTime: number;
    points: number[];
    loop?: Loop | null;
    loopStart?: number | null;
    stalled?: boolean;

    onSeek(time: number): void;
}

interface State {
    pointerRatio: number | null;
    latestPointerRation: number;
}

export class AudioProgressBar extends React.Component<Props, State> {
    private borderRef = createRef<HTMLDivElement>();
    private unmountListeners: () => void;

    constructor(props: Props) {
        super(props);

        this.state = {
            pointerRatio: null,
            latestPointerRation: 0
        };

        this.unmountListeners = () => {
            throw new Error('Listeners were not mounted');
        };
    }

    componentDidMount = () => {
        this.unmountListeners = this.mountListeners();
    };

    componentWillUnmount() {
        this.unmountListeners();
    }

    render = () => {
        const { duration, currentTime, points, loopStart, stalled } = this.props;
        const { pointerRatio, latestPointerRation } = this.state;

        let loop = this.props.loop;
        if (loop == null && loopStart != null) {
            loop = new Loop(loopStart, currentTime);
        }

        let loopFill = null;
        if (loop != null) {
            const left = `${(createRatio(loop.left, duration) * 100).toFixed(2)}%`;
            const width = `${(createRatio(loop.right - loop.left, duration) * 100).toFixed(2)}%`;

            loopFill = <div className="audio-progress-bar-loop-fill" style={{ left, width }} />;
        }

        const currentTimeValue = secondsToStr(currentTime);
        const currentFillRatio = createRatio(currentTime, duration);
        const currentFillPercentStr = `${(currentFillRatio * 100).toFixed(2)}%`;
        const currentTimeTransformStr = `translate(${(5 - 110 * currentFillRatio).toFixed(2)}%, 0)`;

        const finalPointerRation = pointerRatio ?? latestPointerRation;
        const pointerFillOpacity = pointerRatio == null ? '0' : '0.3';
        const pointerTimeOpacity = pointerRatio == null ? '0' : '1';
        const pointerFillPercentStr = `${(finalPointerRation * 100).toFixed(2)}%`;
        const pointerTimeTransformStr = `translate(${(5 - 110 * finalPointerRation).toFixed(2)}%, 0)`;
        const pointerTimeValue = secondsToStr(finalPointerRation * duration);

        return (
            <div className="audio-progress-bar">
                <div className="audio-progress-bar-duration start">00:00</div>
                <div className="audio-progress-bar-duration end">{secondsToStr(duration)}</div>

                <div className="audio-progress-bar-container">
                    <div className="audio-progress-bar-border" ref={this.borderRef}></div>
                    <div
                        className={classNames('audio-progress-bar-current-fill', { 'loading-item': stalled })}
                        style={{ width: currentFillPercentStr }}
                    ></div>

                    {points.map((point, i) => {
                        const ratio = createRatio(point, duration);
                        const leftStr = `${(ratio * 100).toFixed(2)}%`;

                        return <div key={i} style={{ left: leftStr }} className="audio-progress-bar-point"></div>;
                    })}

                    {loopFill}

                    <div
                        className="audio-progress-bar-current-time"
                        style={{ left: currentFillPercentStr, transform: currentTimeTransformStr }}
                    >
                        {currentTimeValue}
                    </div>

                    <div
                        className="audio-progress-bar-pointer-fill"
                        style={{ opacity: pointerFillOpacity, width: pointerFillPercentStr }}
                    ></div>
                    <div
                        className="audio-progress-bar-pointer-time"
                        style={{ opacity: pointerTimeOpacity, left: pointerFillPercentStr, transform: pointerTimeTransformStr }}
                    >
                        {pointerTimeValue}
                    </div>
                </div>
            </div>
        );
    };

    mountListeners = (): (() => void) => {
        const borderElem = this.borderRef.current;
        if (borderElem == null) {
            throw new Error('borderElem can not be null');
        }
        const startSeek = (type: 'mouse' | 'touch') => {
            return (event: unknown) => {
                if (this.props.stalled) {
                    return;
                }

                const width = borderElem.offsetWidth;
                let prevOffset = width * createRatio(this.props.currentTime, this.props.duration);
                let prevX = type === 'mouse' ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].pageX;
                let latestPointerRatio: number | null = null;
                let prevTs = Date.now();
                const deltaXSpeedHistory = new DeltaXSpeedHistory([
                    [1, 1 / 19],
                    [2, 1 / 15],
                    [5, 1 / 10],
                    [10, 1 / 5],
                    [15, 1 / 2],
                    [20, 1],
                    [25, 1.25],
                    [30, 1.5],
                    [40, 1.55],
                    [80, 1.7],
                    [100, 1.8],
                    [125, 1.9],
                    [150, 2],
                    [170, 2]
                ]);
                const move = (event: unknown) => {
                    const now = Date.now();
                    const timeElapsed = now - prevTs;
                    prevTs = now;

                    let deltaX =
                        (type === 'mouse' ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].pageX) - prevX;
                    prevX += deltaX;

                    if (timeElapsed === 0) {
                        return;
                    }

                    const deltaXSpeed = (createRatio(Math.abs(deltaX), width) / (timeElapsed / 1000)) * 100;
                    deltaXSpeedHistory.add(deltaXSpeed);
                    // const speedAverage = deltaXSpeedHistory.getAverage();
                    deltaX *= deltaXSpeedHistory.getCoefficient();
                    deltaX *= 1;
                    // console.log(speedAverage.toFixed(0));

                    // if (speedAverage < 5) {
                    //     deltaX /= 10;
                    // } else if (speedAverage < 10) {
                    //     deltaX /= 5;
                    // } else if (speedAverage > 15) {
                    //     deltaX /= 1;
                    // } else if (speedAverage > 25) {
                    //     deltaX *= 3;
                    // } else if (speedAverage > 40) {
                    //     deltaX *= 6;
                    // } else if (speedAverage > 100) {
                    //     deltaX *= 12;
                    // } else if (speedAverage > 165) {
                    //     deltaX *= 20;
                    // }
                    // if (deltaXSpeed < 1) {
                    //     deltaX /= 10;
                    // } else if (deltaXSpeed < 2) {
                    //     deltaX /= 5;
                    // } else if (deltaXSpeed < 3) {
                    //     deltaX /= 2;
                    // } else if (deltaXSpeed > 4) {
                    //     deltaX *= 1.5;
                    // } else if (deltaXSpeed > 6) {
                    //     deltaX *= 2;
                    // }

                    const nextOffset = prevOffset + deltaX;
                    const pointerRatio = createRatio(nextOffset, width);
                    prevOffset = pointerRatio * width;

                    if (pointerRatio != latestPointerRatio) {
                        this.setState({ pointerRatio });
                    }

                    latestPointerRatio = pointerRatio;
                };
                const up = () => {
                    if (type === 'mouse') {
                        document.body.removeEventListener('mousemove', move);
                        document.body.removeEventListener('mouseup', up);
                        document.body.removeEventListener('mouseleave', up);
                    } else {
                        document.body.removeEventListener('touchmove', move);
                        document.body.removeEventListener('touchend', up);
                        document.body.removeEventListener('touchcancel', up);
                    }

                    this.setState({ pointerRatio: null, latestPointerRation: latestPointerRatio ?? 0 });

                    if (latestPointerRatio != null) {
                        const seekMax = Math.max(this.props.duration - 0.33333, 0);
                        const seekPoint = Math.min(this.props.duration * latestPointerRatio, seekMax);

                        this.props.onSeek(seekPoint);
                    }
                };

                if (type === 'mouse') {
                    document.body.addEventListener('mousemove', move);
                    document.body.addEventListener('mouseup', up);
                    document.body.addEventListener('mouseleave', up);
                } else {
                    document.body.addEventListener('touchmove', move);
                    document.body.addEventListener('touchend', up);
                    document.body.addEventListener('touchcancel', up);
                }
            };
        };

        borderElem.addEventListener('mousedown', startSeek('mouse'));
        borderElem.addEventListener('touchstart', startSeek('touch'));

        return () => {
            borderElem.removeEventListener('mousedown', startSeek('mouse'));
            borderElem.removeEventListener('touchstart', startSeek('touch'));
        };
    };
}

class DeltaXSpeedHistory {
    private butchSize = 10;
    private maxHistorySize = 500;
    private history: number[];
    private intervals: [number, number][];
    constructor(intervals: [number, number][]) {
        this.history = [];
        this.intervals = intervals;
    }

    add(item: number) {
        this.history.push(item);

        if (this.history.length > this.maxHistorySize) {
            const newHistory = [];
            for (let i = this.history.length - this.butchSize * 2; i < this.history.length; i++) {
                newHistory.push(this.history[i]);
            }
            this.history = newHistory;
            console.log('cleared!');
        }
    }

    getAverage(): number {
        let sum = 0;
        const elementsCount = Math.min(this.butchSize, this.history.length);

        if (elementsCount === 0) {
            return 0;
        }

        for (let i = this.history.length - elementsCount; i < this.history.length; i++) {
            sum += this.history[i];
        }

        return sum / elementsCount;
    }

    getCoefficient(): number {
        if (this.intervals.length === 0) {
            return 0;
        }

        const value = this.getAverage();

        for (const interval of this.intervals) {
            if (value < interval[0]) {
                return interval[1];
            }
        }

        return this.intervals[this.intervals.length - 1][1];
    }
}
