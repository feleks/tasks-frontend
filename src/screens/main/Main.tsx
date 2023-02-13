import { faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { Button } from 'src/components/button/Button';
import { useAuthStore } from 'src/stores/auth';
import './Main.scss';

export function Main() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const markNotAuthenticated = useAuthStore((state) => state.markNotAuthenticated);

    useEffect(() => {
        if (user == null) {
            navigate('/login', { replace: true });
        }
    }, [user]);

    if (user == null) {
        return <div className="screen-main"></div>;
    }

    async function logout() {
        markNotAuthenticated();
        await apiCall('/frontend/logout', null);
    }

    return (
        <div className="screen-main">
            <div className="screen-main-left">
                <div className="screen-main-left-top-bar segment">
                    <div className="screen-main-left-top-bar-separator"></div>
                    <div className="screen-main-left-top-bar-user">
                        <div className="screen-main-left-top-bar-user-icon">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div className="screen-main-left-top-bar-user-right">
                            <div className="screen-main-left-top-bar-user-right-title">User</div>
                            <div className="screen-main-left-top-bar-user-right-name">{user.name}</div>
                        </div>
                    </div>
                    <div className="screen-main-left-top-bar-separator"></div>
                    <div className="screen-main-left-top-bar-user-exit">
                        <Button
                            className="screen-main-left-top-bar-user-exit-button"
                            style="red"
                            value={
                                <span>
                                    <FontAwesomeIcon className="exit-icon" icon={faRightFromBracket} />
                                </span>
                            }
                            small
                            onClick={() => {
                                logout();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
