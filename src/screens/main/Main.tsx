import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from 'src/stores/auth';

export function Main() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user == null) {
            navigate('/login', { replace: true });
        }
    }, [user]);

    if (user == null) {
        return <div className="screen-main"></div>;
    }

    return <div className="screen-main">1</div>;
}
