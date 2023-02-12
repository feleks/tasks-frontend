import { faShield, faUser } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { ApiError } from 'src/api/errors';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import { useAuthStore } from 'src/stores/auth';
import { useNotificationStore } from 'src/stores/notifications';
import './Login.scss';

export function Login() {
    const navigate = useNavigate();

    const showNotification = useNotificationStore((state) => state.show);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
    const savedUrl = useAuthStore((state) => state.savedUrl);

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function loginUser() {
        if (loading) {
            return;
        }

        if (login.length === 0 || password.length === 0) {
            showNotification('error', `Login and password can not be empty`);
            return;
        }

        setLoading(true);
        try {
            const user = await apiCall('/frontend/login', {
                login,
                password
            });
            markAuthenticated(user);
            navigate(savedUrl);
        } catch (e) {
            if (ApiError.is(e, 'WrongUsernameOrPassword')) {
                showNotification('error', `Wrong username or password`);
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
