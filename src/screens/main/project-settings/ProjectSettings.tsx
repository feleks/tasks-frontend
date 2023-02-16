import { faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from 'src/api/api_call';
import { ProjectID } from 'src/api/entities';
import { Button } from 'src/components/button/Button';
import { Input } from 'src/components/input/Input';
import { useNotificationStore } from 'src/stores/notification';
import { deleteProject, useProjectStore } from 'src/stores/project';
import './ProjectSettings.scss';

type PathParams = {
    id: string;
};

export function ProjectSettings() {
    const navigate = useNavigate();
    const { id: idRaw } = useParams<PathParams>();
    const projectStorage = useProjectStore((state) => state.projectStorage);
    const addProjects = useProjectStore((state) => state.addProjects);
    const showNotification = useNotificationStore((state) => state.show);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState<string>('');

    const id = parseInt(idRaw ?? '0');
    const project = projectStorage.get(id);
    useEffect(() => {
        if (project != null) {
            setTitle(project.title);
        } else {
            navigate('/projects');
        }
    }, [project]);

    if (project == null) {
        return null;
    }

    async function updateProject(title: string) {
        if (project == null) {
            return;
        }

        setLoading(true);
        try {
            await apiCall('/frontend/update_project', {
                id,
                title: title
            });
            addProjects([
                {
                    id: project.id,
                    title
                }
            ]);
        } catch (e) {
            showNotification('error', 'Failed to update project');
        } finally {
            setLoading(false);
        }
    }

    async function del(id: ProjectID) {
        setLoading(true);
        try {
            await deleteProject(id);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="screen-project-settings segment">
            <div className="segment-title">Project settings</div>
            <form
                className="screen-project-settings-form"
                onSubmit={(e) => {
                    e.preventDefault();

                    if (loading) {
                        return;
                    }

                    const anyChanges = project.title !== title;

                    if (!anyChanges) {
                        showNotification('info', 'No changes made');
                    } else {
                        updateProject(title);
                    }
                }}
            >
                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => {
                        if (loading) {
                            return;
                        }
                        setTitle(e.target.value);
                    }}
                />
                <div className="screen-project-settings-form-buttons">
                    <Button className="screen-project-settings-form-buttons-create" value="Save" submit loading={loading} />
                    <Button
                        className="screen-project-settings-form-buttons-clear"
                        value="Clear"
                        style="grey"
                        onClick={() => {
                            if (loading) {
                                return;
                            }
                            setTitle(project?.title ?? '');
                        }}
                    />
                    <Button
                        className="screen-project-settings-form-buttons-delete"
                        value={<FontAwesomeIcon icon={faTrash} />}
                        style="red"
                        onClick={() => {
                            if (loading) {
                                return;
                            }
                            del(project.id);
                        }}
                        loading={loading}
                    />
                </div>
            </form>
            <div
                className="screen-project-settings-close"
                onClick={() => {
                    navigate('/projects');
                }}
            >
                <FontAwesomeIcon icon={faXmark} />
            </div>
        </div>
    );
}
