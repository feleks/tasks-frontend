import { faShield, faUser } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { apiCall } from 'src/api/api_call';
import { ApiError } from 'src/api/errors';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import { useNotificationStore } from 'src/stores/notifications';
import './Login.scss';

export function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const showNotification = useNotificationStore((state) => state.show);

    async function loginUser() {
        if (loading) {
            return;
        }

        setLoading(true);
        try {
            await apiCall(
                '/frontend/login',
                {
                    login,
                    password
                },
                {
                    mockError: new ApiError('WrongUsernameOrPassword', null)
                }
            );
        } catch (e) {
            if (ApiError.is(e, 'WrongUsernameOrPassword')) {
                showNotification('error', `Failed to login user`);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="segment screen-login"
            onSubmit={(event) => {
                event.preventDefault();
                loginUser();
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
            <Button className="screen-login-login-button" value="Login" submit loading={loading} />
        </form>
    );
}
