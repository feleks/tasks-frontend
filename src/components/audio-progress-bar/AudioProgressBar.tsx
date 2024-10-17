import { createRatio, Loop, secondsToStr } from '../../screens/main/songs/view-song/song-explorer/utils';
import React, { createRef } from 'react';
import './AudioProgressBar.scss';

interface Props {
    duration: number;
    currentTime: number;
    points: number[];
    loop?: Loop | null;
    loopStart?: number | null;

    onSeek(time: number): void;
}

interface State {
    pointerRatio: number | null;
}

export class AudioProgressBar extends React.Component<Props, State> {
    private borderRef = createRef<HTMLDivElement>();
    private unmountListeners: () => void;

    constructor(props: Props) {
        super(props);

        this.state = {
            pointerRatio: null
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
        const { duration, currentTime, points, loopStart } = this.props;
        const { pointerRatio } = this.state;

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

        const currentFillRatio = createRatio(currentTime, duration);
        const currentFillPercentStr = `${(currentFillRatio * 100).toFixed(2)}%`;
        const currentTimeTransformStr = `translate(${(5 - 110 * currentFillRatio).toFixed(2)}%, 0)`;

        let pointerFillPercentStr = '0%';
        let pointerFillOpacity = '0';
        let pointerTimeTransformStr = 'translate(0,0)';
        let pointerTimeOpacity = '0';
        if (pointerRatio != null) {
            pointerFillOpacity = '0.3';
            pointerTimeOpacity = '1';

            pointerFillPercentStr = `${(pointerRatio * 100).toFixed(2)}%`;
            pointerTimeTransformStr = `translate(${(5 - 110 * pointerRatio).toFixed(2)}%, 0)`;
        }

        return (
            <div className="audio-progress-bar">
                <div className="audio-progress-bar-duration start">00:00</div>
                <div className="audio-progress-bar-duration end">{secondsToStr(duration)}</div>

                <div className="audio-progress-bar-container">
                    <div className="audio-progress-bar-border" ref={this.borderRef}></div>
                    <div className="audio-progress-bar-current-fill" style={{ width: currentFillPercentStr }}></div>

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
                        {secondsToStr(currentTime)}
                    </div>

                    <div
                        className="audio-progress-bar-pointer-fill"
                        style={{ opacity: pointerFillOpacity, width: pointerFillPercentStr }}
                    ></div>
                    <div
                        className="audio-progress-bar-pointer-time"
                        style={{ opacity: pointerTimeOpacity, transform: pointerTimeTransformStr }}
                    ></div>
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
                const width = borderElem.offsetWidth;
                const startX = type === 'mouse' ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].pageX;
                const startXOffset = width * createRatio(this.props.currentTime, this.props.duration);
                let latestPointerRatio: number | null = null;
                const move = (event: unknown) => {
                    const deltaX =
                        (type === 'mouse' ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].pageX) - startX;
                    const endOffset = startXOffset + deltaX;
                    const pointerRatio = createRatio(endOffset, width);

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

                    this.setState({ pointerRatio: null });

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
