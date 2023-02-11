import React, { useState } from 'react';
import { Input } from 'src/components/input/Input';
import { faShield, faUser } from '@fortawesome/free-solid-svg-icons';

import './Login.scss';
import { Button } from 'src/components/button/Button';

export function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    return (
        <form
            className="segment screen-login"
            onSubmit={(event) => {
                event.preventDefault();
                console.log('onSubmit', {
                    login,
                    password,
                    event
                });
            }}
        >
            <Input
                label="Login"
                icon={faUser}
                name="login"
                value={login}
                onChange={(event) => {
                    setLogin(event.target.value);
                }}
            />
            <Input
                label="Password"
                icon={faShield}
                name="password"
                value={password}
                password={true}
                onChange={(event) => {
                    setPassword(event.target.value);
                }}
            />
            <Button className="screen-login-login-button" value="Login" submit />
        </form>
    );
}
