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
    }
};

export function mocksEnabled(): boolean {
    if (MOCKS_MODE === 'default') {
        return process.env.NODE_ENV === 'development';
    }

    return MOCKS_MODE === 'force_mocks';
}
