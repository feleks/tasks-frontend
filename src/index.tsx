import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifications } from './components/notifications/Notifications';
import './index.scss';
import { App } from './screens/app/App';
import { Login } from './screens/login/Login';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </BrowserRouter>
        <Notifications />
    </>
);
