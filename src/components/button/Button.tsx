import classNames from 'classnames';
import React from 'react';

import './Button.scss';

interface Props {
    value: string;
    submit?: boolean;
    className?: string;
}

export function Button(props: Props) {
    const { value, submit = false, className } = props;

    return <input className={classNames('component-button', className)} type={submit ? 'submit' : 'button'} value={value} />;
}
