import { faDrum, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { Button } from 'src/components/button/Button';
import { useAuthStore } from 'src/stores/auth';
import './Main.scss';
import { Songs } from './songs/Songs';
import { Projects } from './projects/Projects';
import { ProjectSettings } from './project-settings/ProjectSettings';
import { AddSong } from './songs/add-song/AddSong';

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
                    <div className="screen-main-left-top-bar-logo">
                        <FontAwesomeIcon icon={faDrum} />
                    </div>
                    <div className="screen-main-left-top-bar-separator"></div>
                    <div className="screen-main-left-top-bar-user">
                        <div className="screen-main-left-top-bar-user-icon">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div className="screen-main-left-top-bar-user-right">
                            <div className="screen-main-left-top-bar-user-right-title">Пользователь</div>
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
                <Routes>
                    <Route path="/songs" element={<Songs />} />
                    <Route path="/songs/add" element={<Songs />} />
                    <Route path="/songs/:id" element={<Songs />} />
                    <Route path="/" element={<Songs />} />

                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/settings/:id" element={<Projects />} />
                </Routes>
            </div>
            <Routes>
                <Route
                    path="/projects/settings/:id"
                    element={
                        <div className="screen-main-right">
                            <ProjectSettings />
                        </div>
                    }
                />
                <Route
                    path="/songs/add"
                    element={
                        <div className="screen-main-right">
                            <AddSong />
                        </div>
                    }
                />
            </Routes>
        </div>
    );
}

// <Route path="/projects/settings/:id" element={<Projects />} />
// <Routes>
//     <Route
//         path="/projects/settings/:id"
//         element={
//             <div className="screen-main-right">
//                 <ProjectSettings />
//             </div>
//         }
//     />
// </Routes>
