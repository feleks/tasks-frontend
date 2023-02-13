import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import { useAuthStore } from 'src/stores/auth';
import { useNotificationStore } from 'src/stores/notifications';
import './SignUp.scss';

export function SignUp() {
    const navigate = useNavigate();

    const showNotification = useNotificationStore((state) => state.show);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
    const savedUrl = useAuthStore((state) => state.savedUrl);

    const [loading, setLoading] = useState(false);
    const [login, setLogin] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [email, setEmail] = useState('');

    async function signUp() {
        if (loading) {
            return;
        }
        if (
            login.length === 0 ||
            name.length === 0 ||
            password.length === 0 ||
            passwordRepeat.length === 0 ||
            email.length === 0
        ) {
            showNotification('error', 'All fields must be filled');
            return;
        }
        if (password !== passwordRepeat) {
            showNotification('error', 'Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const user = await apiCall('/frontend/sign_up', {
                login,
                password,
                email,
                name
            });

            markAuthenticated(user);
            navigate(savedUrl);
        } catch (e) {
            //
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="segment screen-sign-up"
            onSubmit={(event) => {
                event.preventDefault();
                signUp();
            }}
        >
            <div className="screen-sign-up-title">Signing up</div>
            <Input
                label="Login"
                name="login"
                value={login}
                onChange={(event) => {
                    setLogin(event.target.value);
                }}
            />
            <Input
                label="Name"
                name="name"
                value={name}
                onChange={(event) => {
                    setName(event.target.value);
                }}
            />
            <Input
                label="Password"
                name="password"
                password={true}
                value={password}
                onChange={(event) => {
                    setPassword(event.target.value);
                }}
            />
            <Input
                label="Repeat password"
                name="password"
                password={true}
                value={passwordRepeat}
                onChange={(event) => {
                    setPasswordRepeat(event.target.value);
                }}
            />
            <Input
                label="Email"
                name="email"
                value={email}
                onChange={(event) => {
                    setEmail(event.target.value);
                }}
            />
            <div className="screen-sign-up-buttons">
                <Button className="screen-sign-up-buttons-sign-up" value="Sign up" submit loading={loading} />
                <Link to="/login">
                    <Button className="screen-sign-up-buttons-back" style="grey" value="Back" />
                </Link>
            </div>
        </form>
    );
}
