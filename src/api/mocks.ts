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

let lastSongID = 0;
function getSongID(): number {
    return lastSongID++;
}

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
            login: req.login
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

        const list = [
            {
                id: getSongID(),
                name: 'Chop Sue',
                performer: 'System of a down',
                format: 'flac'
            },
            {
                id: getSongID(),
                name: 'Chop Sue',
                performer: 'System of a down',
                format: 'mp3'
            },
            {
                id: getSongID(),
                name: 'Unknown Song(',
                format: 'mp3'
            },
            {
                id: getSongID(),
                name: 'LonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglong LonglongLonglongLonglongLonglong',
                performer:
                    'LonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglongLonglong',
                format: 'mp3'
            },
            {
                id: getSongID(),
                name: 'Taking Me Over',
                performer: 'Hollowick',
                format: 'mp3'
            }
        ];

        for (let i = 10; i < 100; i++) {
            list.push({
                id: getSongID(),
                name: `Taking Me Over ${i}`,
                performer: 'Hollowick',
                format: 'mp3'
            });
        }
        return { songs: list };
    },
    '/frontend/get_song': (req) => {
        return {
            id: req.id,
            name: 'Chop Sue',
            performer: 'System of a down',
            format: 'flac',
            actions: [
                {
                    id: getSongID(),
                    type: 'point',
                    created_at: new Date().toISOString(),
                    name: 'Введение',
                    point: 13
                },
                {
                    id: getSongID(),
                    type: 'point',
                    created_at: new Date().toISOString(),
                    name: 'Введение',
                    point: 13
                },
                {
                    id: getSongID(),
                    type: 'point',
                    created_at: new Date().toISOString(),
                    point: 13
                },
                {
                    id: getSongID(),
                    type: 'loop',
                    created_at: new Date().toISOString(),
                    name: 'Припев Припев Припев Припев ПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипевПрипев',
                    loop: [12, 22]
                }
            ]
        };
    },
    '/frontend/create_song': (req) => {
        return {
            id: getSongID(),
            name: req.name,
            performer: req.performer,
            format: req.format
        };
    },
    '/frontend/create_action': (req) => {
        return {
            id: getSongID(),
            type: req.type,
            created_at: new Date().toISOString(),
            point: req.point,
            loop: req.loop
        };
    },
    '/frontend/update_action': (req) => {
        return null;
    },
    '/frontend/delete_action': (req) => {
        return null;
    },
    '/frontend/update_song': (req) => {
        return null;
    },
    '/frontend/delete_song': (req) => {
        return null;
    }
};

export function mocksEnabled(): boolean {
    return false;

    if (MOCKS_MODE === 'default') {
        return process.env.NODE_ENV === 'development';
    }

    return MOCKS_MODE === 'force_mocks';
}
