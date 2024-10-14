import { faDrum, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { Button } from 'src/components/button/Button';
import { useAuthStore } from 'src/stores/auth';
import './Main.scss';
import { Songs } from './songs/Songs';
import { AddSong } from './songs/add-song/AddSong';
import { ViewSong } from './songs/view-song/ViewSong';

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

    // const cnt = [];
    // for (let i = 0; i < 1000; i++) {
    //     cnt.push(<div key={i}>{i + 1}) !!!!!!!</div>);
    // }

    return (
        <>
            <div className="screen-main-left-top-bar segment">
                <div className="screen-main-left-top-bar-logo">
                    <FontAwesomeIcon icon={faDrum} />
                </div>
                <div className="screen-main-left-top-bar-user">
                    <div className="screen-main-left-top-bar-user-icon">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="screen-main-left-top-bar-user-right">
                        <div className="screen-main-left-top-bar-user-right-title">Пользователь</div>
                        <div className="screen-main-left-top-bar-user-right-name">{user.login}</div>
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
            <div className="screen-main-content segment">
                <Routes>
                    <Route path="/songs" element={<Songs />} />
                    <Route path="/" element={<Songs />} />
                    <Route
                        path="/songs/add"
                        element={
                            <div className="screen-main-right">
                                <AddSong />
                            </div>
                        }
                    />
                    <Route
                        path="/songs/:id"
                        element={
                            <div className="screen-main-right">
                                <ViewSong />
                            </div>
                        }
                    />
                </Routes>
            </div>

            {/* <Routes>*/}
            {/*    <Route path="/songs" element={<Songs />} />*/}
            {/*    <Route path="/" element={<Songs />} />*/}
            {/* </Routes>*/}

            {/* <Routes>*/}
            {/*    <Route*/}
            {/*        path="/projects/settings/:id"*/}
            {/*        element={*/}
            {/*            <div className="screen-main-right">*/}
            {/*                <ProjectSettings />*/}
            {/*            </div>*/}
            {/*        }*/}
            {/*    />*/}
            {/*    <Route*/}
            {/*        path="/songs/add"*/}
            {/*        element={*/}
            {/*            <div className="screen-main-right">*/}
            {/*                <AddSong />*/}
            {/*            </div>*/}
            {/*        }*/}
            {/*    />*/}
            {/*    <Route*/}
            {/*        path="/songs/:id"*/}
            {/*        element={*/}
            {/*            <div className="screen-main-right">*/}
            {/*                <ViewSong />*/}
            {/*            </div>*/}
            {/*        }*/}
            {/*    />*/}
            {/* </Routes>*/}
        </>
    );
}
