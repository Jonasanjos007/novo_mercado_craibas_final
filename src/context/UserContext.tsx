import React, { createContext, useContext, useState } from 'react';
import { User } from '../models/User';

interface UserContextData {
    user: User | null;
    saveUser: (user: User) => void;
    clearUser: () => void;
}

const UserContext = createContext<UserContextData>(
    {} as UserContextData
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('@app:user');
        return stored ? JSON.parse(stored) : null;
    });

    const saveUser = (user: User) => {
        localStorage.setItem('@app:user', JSON.stringify(user));
        setUser(user);
    };

    const clearUser = () => {
        localStorage.removeItem('@app:user');
        localStorage.removeItem('@app:tokens');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, saveUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
