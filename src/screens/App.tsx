import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { ApiError } from 'src/api/errors';
import { Button } from 'src/components/button/Button';
import { Notifications } from 'src/components/notifications/Notifications';
import { useAuthStore } from 'src/stores/auth';
import './App.scss';
import { Login } from './login/Login';
import { Main } from './main/Main';
import { SignUp } from './sign_up/SignUp';

export function App() {
    const [status, globalError] = useAuthStore((state) => [state.status, state.globalError]);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);
    const markError = useAuthStore((state) => state.markError);

    async function authenticate() {
        try {
            const user = await apiCall('/frontend/auth', null);
            markAuthenticated(user);
        } catch (e) {
            if (!ApiError.is(e, 'NotAuthenticated')) {
                markError(`${e}`);
                throw e;
            }
        }
    }

    useEffect(() => {
        authenticate();
    }, []);

    let body: JSX.Element;
    if (status === 'in_progress') {
        body = (
            <div className="screen-app-spinner">
                <FontAwesomeIcon className="spinner" icon={faSpinner} />
            </div>
        );
    } else if (status === 'error') {
        body = (
            <div className="screen-app-error">
                <div className="screen-app-error-title">Something went wrong</div>
                <div className="screen-app-error-details">{globalError}</div>
                <div className="screen-app-error-button">
                    <Button
                        value="Reload page"
                        onClick={() => {
                            location.reload();
                        }}
                    />
                </div>
            </div>
        );
    } else {
        body = (
            <BrowserRouter>
                <Routes>
                    <Route path="/sign_up" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={<Main />} />
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <div className="screen-app">
            {body}
            <Notifications />
        </div>
    );
}
