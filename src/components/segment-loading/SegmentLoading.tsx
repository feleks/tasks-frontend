import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import classNames from 'classnames';

interface Props {
    overlay?: boolean;
}

export function SegmentLoading(props: Props) {
    const { overlay = false } = props;

    return (
        <div className={classNames('segment-loading', { 'segment-loading-overlay': overlay })}>
            <FontAwesomeIcon className="spinner" icon={faSpinner} />
        </div>
    );
}
