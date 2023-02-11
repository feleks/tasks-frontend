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
}

export function Button(props: Props) {
    const { value, submit = false, loading = false, className } = props;

    // return <input className={classNames('component-button', className)} type={submit ? 'submit' : 'button'} value={value} />;

    let finalValue: any = value;
    if (loading) {
        finalValue = <FontAwesomeIcon className="spinner" icon={faSpinner} />;
    }

    return (
        <button type={submit ? 'submit' : 'button'} className={classNames('component-button', { loading }, className)}>
            {finalValue}
        </button>
    );
}
