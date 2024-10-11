import { Api } from './api';
import { Project } from './entities';

export const MOCKS_MODE: 'default' | 'force_mocks' | 'force_fetch' = 'default';
export const MOCKS_TIMEOUT = 1000;

type Mocks = {
    [K in keyof Api]: (req: Api[K]['request']) => Api[K]['response'];
};

let testProjectsLastID = 0;
const testProjects: Project[] = [];
for (let i = 1; i <= 100; i++) {
    testProjects.push({
        id: ++testProjectsLastID,
        title: `Project #${i}`
    });
}

let lastSongID = 112312;

export const mocks: Mocks = {
    '/frontend/login': (req) => {
        return {
            login: 'feleks',
            email: 'nashvel@gmail.com',
            name: 'Георгий Калинчук',
            phone: '+7 (925) 559-14-41'
        };
    },
    '/frontend/auth': () => {
        return {
            login: 'feleks',
            email: 'nashvel@gmail.com',
            name: 'Георгий Калинчук',
            phone: '+7 (925) 559-14-41'
        };
    },
    '/frontend/sign_up': (req) => {
        return {
            login: req.login,
            email: req.email,
            name: req.name
        };
    },
    '/frontend/logout': () => {
        return null;
    },

    '/frontend/get_projects': (req) => {
        return {
            projects: testProjects
        };
    },
    '/frontend/create_project': (req) => {
        return {
            id: ++testProjectsLastID,
            title: req.title
        };
    },
    '/frontend/update_project': (req) => {
        const project = testProjects.find((project) => {
            return project.id === req.id;
        });
        if (project != null && req.title != null) {
            project.title = req.title;
        }

        return null;
    },
    '/frontend/delete_project': (req) => {
        const projectIndex = testProjects.findIndex((project) => {
            return project.id === req.id;
        });

        if (projectIndex > -1) {
            testProjects.splice(projectIndex, 1);
        }

        return null;
    },

    '/frontend/list_songs': (req) => {
        // const rand = Math.random();
        // if (rand < Math.random()) {
        //     return [];
        // } else if (rand < Math.random()) {
        //     throw new Error('Произошла невероятная тестовая ошибко очень большой длины');
        // }

        return [
            {
                id: 1,
                name: 'Chop Sue',
                performer: 'System of a down',
                format: 'flac'
                // actions_history: [
                //     {
                //         id: 1,
                //         type: 'navigate',
                //         navigate: 1.35
                //     },
                //     {
                //         id: 2,
                //         type: 'loop',
                //         loop: [10, 15]
                //     }
                // ],
                // saved_actions: [
                //     {
                //         id: 3,
                //         type: 'navigate',
                //         name: 'Введение',
                //         navigate: 13
                //     },
                //     {
                //         id: 4,
                //         type: 'loop',
                //         name: 'Припев',
                //         loop: [12, 22]
                //     }
                // ]
            },
            {
                id: 2,
                name: 'Chop Sue',
                performer: 'System of a down',
                format: 'mp3'
            },
            {
                id: 3,
                name: 'Taking Me Over',
                performer: 'Hollowick',
                format: 'mp3'
            }
        ];
    },
    '/frontend/get_song': (req) => {
        return {
            id: req.id,
            name: 'Chop Sue',
            performer: 'System of a down',
            format: 'flac',
            actions_history: [
                {
                    id: 1,
                    type: 'navigate',
                    navigate: 1.35
                },
                {
                    id: 2,
                    type: 'loop',
                    loop: [10, 15]
                }
            ],
            saved_actions: [
                {
                    id: 3,
                    type: 'navigate',
                    name: 'Введение',
                    navigate: 13
                },
                {
                    id: 4,
                    type: 'loop',
                    name: 'Припев',
                    loop: [12, 22]
                }
            ]
        };
    },
    '/frontend/create_song': (req) => {
        return {
            id: ++lastSongID,
            name: req.name,
            format: req.format
        };
    }
};

export function mocksEnabled(): boolean {
    if (MOCKS_MODE === 'default') {
        return process.env.NODE_ENV === 'development';
    }

    return MOCKS_MODE === 'force_mocks';
}
