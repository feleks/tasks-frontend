import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { Notifications } from 'src/components/notifications/Notifications';
import { useAuthStore } from 'src/stores/auth';
import './App.scss';
import { Login } from './login/Login';
import { Main } from './main/Main';
import { SignUp } from './sign_up/SignUp';

export function App() {
    const status = useAuthStore((state) => state.status);
    const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

    async function authenticate() {
        const user = await apiCall('/frontend/auth', null);
        markAuthenticated(user);
    }

    useEffect(() => {
        authenticate();
    }, []);

    if (status === 'in_progress') {
        return (
            <div className="screen-app">
                <div className="screen-app-spinner">
                    <FontAwesomeIcon className="spinner" icon={faSpinner} />
                </div>
            </div>
        );
    }

    return (
        <div className="screen-app">
            <BrowserRouter>
                <Routes>
                    <Route path="/sign_up" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={<Main />} />
                </Routes>
            </BrowserRouter>

            <Notifications />
        </div>
    );
}
