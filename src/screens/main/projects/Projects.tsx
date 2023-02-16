import { faExclamation, faGear, faList, faPlus, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useLayoutEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'src/components/button/Button';
import { getProjects, useProjectStore } from 'src/stores/project';
import './Projects.scss';

type PathParams = {
    id: string;
};

export function Projects() {
    const navigate = useNavigate();
    const listRef = useRef<HTMLDivElement>(null);
    const projectListScreen = useProjectStore((state) => state.projectListScreen);
    const projectStorage = useProjectStore((state) => state.projectStorage);
    const { id: selectedProjectIDRaw } = useParams<PathParams>();

    async function getInitialProjects() {
        await getProjects(true);
    }

    useLayoutEffect(() => {
        getInitialProjects();
    }, []);

    let content: any = null;

    if (projectListScreen.state.status === 'loading') {
        content = (
            <div className="screen-projects-list-loading">
                <div className="screen-projects-list-loading-item loading-item" />
                <div className="screen-projects-list-loading-item loading-item" />
                <div className="screen-projects-list-loading-item loading-item" />
                <div className="screen-projects-list-loading-item loading-item" />
                <div className="screen-projects-list-loading-item loading-item" />
            </div>
        );
    } else if (projectListScreen.state.status === 'error') {
        content = (
            <div className="screen-projects-list-error">
                <FontAwesomeIcon icon={faExclamation} className="screen-projects-list-error-icon" />
                <div className="screen-projects-list-error-text">Failed to get projects: {projectListScreen.state.error}</div>
                <Button
                    className="screen-projects-list-error-reload"
                    value={
                        <span>
                            <FontAwesomeIcon icon={faRotateRight} /> Retry
                        </span>
                    }
                    style="grey"
                    onClick={() => {
                        getProjects(true);
                    }}
                />
            </div>
        );
    } else if (projectListScreen.projects.length === 0) {
        content = (
            <div className="screen-projects-list-empty">
                <FontAwesomeIcon icon={faList} className="screen-projects-list-empty-icon" />
                <div className="screen-projects-list-empty-text">No projects created yet</div>
            </div>
        );
    } else {
        content = projectListScreen.projects.map((projectID, i) => {
            const project = projectStorage.get(projectID);
            if (project == null) {
                throw new Error('Project can not by null at this point');
            }

            let selected = false;
            if (selectedProjectIDRaw != null) {
                if (parseInt(selectedProjectIDRaw) === projectID) {
                    selected = true;
                }
            }

            return (
                <div key={projectID} className="screen-projects-list-item-wrapper">
                    <div className={classNames('screen-projects-list-item', { 'selected-item': selected })}>
                        {project?.title}
                        <div
                            className="screen-projects-list-item-settings"
                            onClick={() => {
                                navigate(`/projects/settings/${project?.id}`);
                            }}
                        >
                            <FontAwesomeIcon icon={faGear} />
                        </div>
                    </div>
                    {i < projectListScreen.projects.length - 1 ? <div className="screen-projects-list-item-separator" /> : null}
                </div>
            );
        });
        if (projectListScreen.loadingMore) {
            content.push(
                <div key="loading-more" className="screen-projects-list-loading-more">
                    <FontAwesomeIcon className="spinner" icon={faSpinner} /> Loading more
                </div>
            );
        }
    }

    return (
        <div className="screen-projects segment">
            <div className="screen-projects-add">
                <div className="screen-projects-add-button">
                    <Button
                        value={
                            <span>
                                <FontAwesomeIcon icon={faPlus} /> Create new project
                            </span>
                        }
                        small
                    />
                </div>
            </div>
            <div className="screen-projects-list" ref={listRef}>
                {content}
            </div>
        </div>
    );
}
