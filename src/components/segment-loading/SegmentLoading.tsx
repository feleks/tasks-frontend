import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import classNames from 'classnames';

interface Props {
    overlay?: boolean;
    text?: string;
}

export function SegmentLoading(props: Props) {
    const { text, overlay = false } = props;

    return (
        <div className={classNames('segment-loading', { 'segment-loading-overlay': overlay })}>
            <FontAwesomeIcon className="spinner" icon={faSpinner} />
            {text != null ? <div className="segment-loading-text">{text}</div> : null}
        </div>
    );
}
