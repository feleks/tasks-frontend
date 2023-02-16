import { Map } from 'immutable';
import { User, UserID } from 'src/api/entities';
import { create } from 'zustand';

interface UserStore {
    users: Map<UserID, User>;

    addUsers(users: User[]): void;
}

export const useUserStore = create<UserStore>()((set) => ({
    users: Map(),

    addUsers(users: User[]): void {
        set((state) => {
            const newUsers = state.users.withMutations((usersMutable) => {
                for (const user of users) {
                    usersMutable.set(user.id, user);
                }
            });

            return {
                users: newUsers
            };
        });
    }
}));
