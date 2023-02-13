import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import './Button.scss';

interface Props {
    value: string;
    submit?: boolean;
    loading?: boolean;
    className?: string;
    style?: 'blue' | 'grey';
}

export function Button(props: Props) {
    const { value, submit = false, loading, style = 'blue', className } = props;

    let includeLoading = false;
    if (loading != null) {
        includeLoading = true;
    }

    let loadingFragment: JSX.Element | null = null;
    if (includeLoading) {
        loadingFragment = (
            <div className="component-button-spinner">
                <FontAwesomeIcon className="spinner" icon={faSpinner} />
            </div>
        );
    }

    return (
        <button
            type={submit ? 'submit' : 'button'}
            className={classNames('component-button', `style-${style}`, { loading }, className)}
        >
            {value}
            {loadingFragment}
        </button>
    );
}
