import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import { useAuthStore } from 'src/stores/auth';
import { useNotificationStore } from 'src/stores/notification';
import './SignUp.scss';

export function SignUp() {
    const navigate = useNavigate();

    const showNotification = useNotificationStore((state) => state.show);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
    const savedUrl = useAuthStore((state) => state.savedUrl);

    const [loading, setLoading] = useState(false);
    const [login, setLogin] = useState('');
    // const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    // const [email, setEmail] = useState('');

    async function signUp() {
        if (loading) {
            return;
        }
        if (
            login.length === 0 ||
            // name.length === 0 ||
            password.length === 0 ||
            passwordRepeat.length === 0
            // email.length === 0
        ) {
            showNotification('error', 'Все поля должны быть заполнены');
            return;
        }
        if (password !== passwordRepeat) {
            showNotification('error', 'Пароли не совпадают');
            return;
        }

        setLoading(true);

        try {
            const user = await apiCall('/frontend/sign_up', {
                login,
                password
                // email,
                // name
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
            <div className="screen-sign-up-title">Регистрация</div>
            <Input
                label="Логин"
                name="login"
                value={login}
                onChange={(event) => {
                    setLogin(event.target.value);
                }}
            />
            {/* <Input*/}
            {/*    label="Name"*/}
            {/*    name="name"*/}
            {/*    value={name}*/}
            {/*    onChange={(event) => {*/}
            {/*        setName(event.target.value);*/}
            {/*    }}*/}
            {/* />*/}
            <Input
                label="Пароль"
                name="password"
                password={true}
                value={password}
                onChange={(event) => {
                    setPassword(event.target.value);
                }}
            />
            <Input
                label="Повторите пароль"
                name="password"
                password={true}
                value={passwordRepeat}
                onChange={(event) => {
                    setPasswordRepeat(event.target.value);
                }}
            />
            {/* <Input*/}
            {/*    label="Email"*/}
            {/*    name="email"*/}
            {/*    value={email}*/}
            {/*    onChange={(event) => {*/}
            {/*        setEmail(event.target.value);*/}
            {/*    }}*/}
            {/* />*/}
            <div className="screen-sign-up-buttons">
                <Button className="screen-sign-up-buttons-sign-up" value="Зарегистрироваться" submit loading={loading} />
                <Link to="/login">
                    <Button className="screen-sign-up-buttons-back" style="grey" value="Назад" />
                </Link>
            </div>
        </form>
    );
}
