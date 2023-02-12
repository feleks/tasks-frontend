import React from 'react';
import { Link } from 'react-router-dom';
import './App.scss';

export function App() {
    return (
        <div className="screen-app">
            hello
            <Link to="/login">Go to login!</Link>
        </div>
    );
}
