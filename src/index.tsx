import React from 'react';
import ReactDOM from 'react-dom/client';
import { Notifications } from './components/notifications/Notifications';

import './index.scss';
import { Login } from './screens/login/Login';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <Login />
        <Notifications />
    </React.StrictMode>
);
