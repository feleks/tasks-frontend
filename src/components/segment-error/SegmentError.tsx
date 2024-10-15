import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../button/Button';
import React from 'react';
import { ScreenState } from '../../stores/screen';

interface Props {
    screenState: ScreenState;
    reload(): void;
}
export function SegmentError(props: Props) {
    const { screenState, reload } = props;

    return (
        <div className="segment-error">
            <FontAwesomeIcon icon={faCircleExclamation} className="segment-error-icon" />
            <div className="segment-error-text">{screenState.error ?? 'Неизвестная ошибка'}</div>
            <Button
                className="segment-error-reload"
                value={
                    <span>
                        <FontAwesomeIcon icon={faRotateRight} /> Перезагрузить
                    </span>
                }
                style="grey"
                onClick={reload}
            />
        </div>
    );
}
