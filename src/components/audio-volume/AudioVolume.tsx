import React, { createRef } from 'react';
import './AudioVolume.scss';
import { createRatio, leadingZero } from '../../screens/main/songs/view-song/song-explorer/utils';
import * as icons from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

interface Props {
    volume: number;
    subTrack?: {
        index: number;
        name: string;
    };

    onVolumeUpdate(newVolume: number): void;
}

interface State {
    savedVolume: number;
    volumePointer: number | null;
}

const subTrackColors = ['#0071ff', '#01aba0', '#fee38a', '#FC7A57', '#6B5CA5'];

export class AudioVolume extends React.Component<Props, State> {
    private unmountListeners = () => {
        //
    };
    private borderRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);

        this.state = {
            savedVolume: props.volume,
            volumePointer: null
        };
    }

    componentDidMount() {
        this.unmountListeners = this.mountListeners();
    }

    componentWillUnmount() {
        this.unmountListeners();
    }

    render = () => {
        const { volume, subTrack } = this.props;
        const { volumePointer } = this.state;

        let color = subTrackColors[0];
        if (subTrack != null) {
            color = subTrackColors[subTrack.index % subTrackColors.length];
        }

        const fillRatioPercent = `${(volume * 100).toFixed(2)}%`;
        const fillTextTransform = `translate(${(15 - 130 * volume).toFixed(2)}%, 0)`;

        let pointerRationPercent = fillRatioPercent;
        let pointerFillOpacity = '0';
        let pointerTextOpacity = '0';
        let pointerTextTransform = fillTextTransform;
        if (volumePointer != null) {
            pointerRationPercent = `${(volumePointer * 100).toFixed(2)}%`;
            pointerFillOpacity = '0.25';
            pointerTextOpacity = '1';
            pointerTextTransform = `translate(${(15 - 130 * volumePointer).toFixed(2)}%, 0)`;
        }

        let icon;
        if (volume > 0.4) {
            icon = <FontAwesomeIcon className="audio-volume-subtrack-slider-current-text-icon" icon={icons.faVolumeHigh} />;
        } else if (volume > 0.1) {
            icon = <FontAwesomeIcon className="audio-volume-subtrack-slider-current-text-icon" icon={icons.faVolumeLow} />;
        } else if (volume > 0) {
            icon = <FontAwesomeIcon className="audio-volume-subtrack-slider-current-text-icon" icon={icons.faVolumeOff} />;
        } else {
            icon = <FontAwesomeIcon className="audio-volume-subtrack-slider-current-text-icon" icon={icons.faVolumeXmark} />;
        }

        return (
            <div className="audio-volume">
                <div className="audio-volume-subtrack">
                    {subTrack == null ? null : (
                        <>
                            <div
                                className={classNames('audio-volume-subtrack-check', { 'check-selected': volume > 0 })}
                                onClick={this.toggleMute}
                            >
                                <FontAwesomeIcon icon={icons.faCheck} />
                            </div>
                            <div
                                className={classNames('audio-volume-subtrack-name', { 'check-unselected': volume === 0 })}
                                onClick={this.toggleMute}
                                style={{ color }}
                            >
                                {subTrack.name}
                            </div>
                        </>
                    )}
                    <div className="audio-volume-subtrack-slider">
                        <div ref={this.borderRef} className="audio-volume-subtrack-slider-border"></div>
                        <div
                            className="audio-volume-subtrack-slider-current-fill"
                            style={{ backgroundColor: color, width: fillRatioPercent }}
                        ></div>
                        <div
                            className="audio-volume-subtrack-slider-current-text"
                            style={{ left: fillRatioPercent, transform: fillTextTransform }}
                        >
                            {icon}
                            {leadingZero(volume * 100)}
                        </div>
                        <div
                            className="audio-volume-subtrack-slider-pointer-fill"
                            style={{ opacity: pointerFillOpacity, width: pointerRationPercent }}
                        ></div>
                        <div
                            className="audio-volume-subtrack-slider-pointer-text"
                            style={{
                                opacity: pointerTextOpacity,
                                left: pointerRationPercent,
                                transform: pointerTextTransform
                            }}
                        >
                            {((volumePointer ?? volume) * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    toggleMute = () => {
        if (this.props.volume > 0) {
            this.props.onVolumeUpdate(0);

            this.setState({
                savedVolume: this.props.volume
            });
            this.props.onVolumeUpdate(0);
        } else {
            this.props.onVolumeUpdate(this.state.savedVolume === 0 ? 0.3 : this.state.savedVolume);
        }
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
                const startXOffset = width * createRatio(this.props.volume, 1);
                let latestVolumePointer: number | null = null;
                const move = (event: unknown) => {
                    const deltaX =
                        (type === 'mouse' ? (event as MouseEvent).pageX : (event as TouchEvent).touches[0].pageX) - startX;
                    const endOffset = startXOffset + deltaX;
                    const volumePointer = createRatio(endOffset, width);

                    if (volumePointer != latestVolumePointer) {
                        this.setState({ volumePointer });
                    }

                    latestVolumePointer = volumePointer;
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

                    this.setState({ volumePointer: null });

                    if (latestVolumePointer != null) {
                        this.props.onVolumeUpdate(latestVolumePointer);
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
