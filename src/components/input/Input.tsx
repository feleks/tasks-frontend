import React, { ChangeEventHandler, FocusEventHandler, useState } from 'react';
import { faEye, faEyeSlash, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Input.scss';

interface Props {
    icon?: IconDefinition;
    label: string;
    value?: string;
    name?: string;
    password?: boolean;
    className?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    small?: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
}

export function Input(props: Props) {
    const { inputRef, onBlur, small, icon, label, value, name, password = false, onChange, className } = props;

    const [showPassword, setShowPassword] = useState(false);

    const hasIcon = icon != null;
    let iconElement: JSX.Element | null = null;
    if (hasIcon) {
        iconElement = (
            <div className="component-input-icon">
                <FontAwesomeIcon icon={icon} />
            </div>
        );
    }

    let passwordIconElement: JSX.Element | null = null;
    if (password) {
        passwordIconElement = (
            <div
                className="component-input-password-icon"
                onClick={() => {
                    setShowPassword(!showPassword);
                }}
            >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
            </div>
        );
    }

    const componentClassName = classNames('component-input', { 'has-icon': hasIcon }, className);
    const inputClassNames = classNames('component-input-input', { 'has-icon': hasIcon, 'is-password': password, small });
    const labelClassNames = classNames('component-input-label', { 'has-icon': hasIcon, small });

    let inputType = 'input';
    if (password && !showPassword) {
        inputType = 'password';
    }

    return (
        <div className={componentClassName}>
            {iconElement}
            {passwordIconElement}
            <input
                ref={inputRef}
                className={inputClassNames}
                type={inputType}
                value={value}
                placeholder={label}
                name={name}
                onChange={onChange}
                onBlur={onBlur}
            />
            <label className={labelClassNames} htmlFor={name}>
                {label}
            </label>
        </div>
    );
}
