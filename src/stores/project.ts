import { Map } from 'immutable';
import { apiCall } from 'src/api/api_call';
import { Project, ProjectID } from 'src/api/entities';
import { create } from 'zustand';
import { useNotificationStore } from './notification';
import { ScreenState } from './screen';

interface ProjectStore {
    projectStorage: Map<ProjectID, Project>;

    projectListScreen: {
        projects: ProjectID[];
        state: ScreenState;
        loadingMore: boolean;
    };

    projectsListScreenAddProjects(projects: Project[], replace?: boolean): void;
    projectsListScreenGetError(error: string): void;
    projectsListScreenStartLoading(replace?: boolean): void;
    projectsListScreenDeleteProject(projectID: ProjectID): void;

    addProjects(projects: Project[]): void;
}

export const useProjectStore = create<ProjectStore>()((set) => ({
    projectStorage: Map(),
    projectListScreen: {
        projects: [],
        state: {
            status: 'loading'
        },
        loadingMore: false
    },

    projectsListScreenAddProjects(projects: Project[], replace = false): void {
        set((state) => {
            const newProjects = state.projectStorage.asMutable();
            if (replace) {
                newProjects.clear();
            }

            const newProjectsList = replace ? [] : [...state.projectListScreen.projects];
            for (const project of projects) {
                newProjects.set(project.id, project);
                newProjectsList.push(project.id);
            }

            return {
                projectStorage: newProjects.asImmutable(),
                projectListScreen: {
                    projects: newProjectsList,
                    state: {
                        status: 'ok'
                    },
                    loadingMore: false
                }
            };
        });
    },
    projectsListScreenGetError(error: string): void {
        set((state) => {
            return {
                projectListScreen: {
                    projects: state.projectListScreen.projects,
                    state: {
                        status: 'error',
                        error: error
                    },
                    loadingMore: false
                }
            };
        });
    },
    projectsListScreenStartLoading(replace = false): void {
        set((state) => {
            if (replace) {
                return {
                    projectListScreen: {
                        ...state.projectListScreen,
                        state: {
                            status: 'loading'
                        }
                    }
                };
            } else {
                return {
                    projectListScreen: {
                        ...state.projectListScreen,
                        loadingMore: true
                    }
                };
            }
        });
    },
    projectsListScreenDeleteProject(projectID: ProjectID): void {
        set((state) => {
            const projectsCopy = [...state.projectListScreen.projects];
            const index = projectsCopy.indexOf(projectID);
            if (index === -1) {
                return {};
            }

            projectsCopy.splice(index, 1);
            console.log('projects copy', projectsCopy, index);

            return {
                projectListScreen: {
                    ...state.projectListScreen,
                    projects: projectsCopy
                },
                projectStorage: state.projectStorage.delete(projectID)
            };
        });
    },
    addProjects(projects: Project[]): void {
        set((state) => {
            const newProjects = state.projectStorage.withMutations((projectsMutable) => {
                for (const project of projects) {
                    projectsMutable.set(project.id, project);
                }
            });

            return {
                projectStorage: newProjects
            };
        });
    }
}));

(window as any)['useProjectStore'] = useProjectStore;

export async function getProjects(replace: boolean) {
    const projectStore = useProjectStore.getState();

    projectStore.projectsListScreenStartLoading(replace);

    try {
        const res = await apiCall('/frontend/get_projects', null);

        projectStore.projectsListScreenAddProjects(res.projects, replace);
    } catch (e) {
        projectStore.projectsListScreenGetError(`${e}`);
        throw e;
    }
}

export async function deleteProject(id: ProjectID) {
    const projectStore = useProjectStore.getState();

    try {
        await apiCall('/frontend/delete_project', { id });

        projectStore.projectsListScreenDeleteProject(id);
    } catch (e) {
        useNotificationStore.getState().show('error', `Failed to delete project ${id}`);
        throw e;
    }
}
