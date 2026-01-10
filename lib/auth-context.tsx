// Context para autenticação global
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, setCurrentUser, logout as logoutStorage } from '@/lib/storage';

interface AuthContextType {
    user: User | null;
    login: (email: string, senha: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Carregar usuário do localStorage ao inicializar
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (email: string, senha: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            // Buscar usuários do localStorage
            const users = JSON.parse(localStorage.getItem('extrema_users') || '[]');
            const foundUser = users.find(
                (u: User) => u.email === email && u.senha === senha
            );

            if (foundUser) {
                setCurrentUser(foundUser);
                setUser(foundUser);
                setIsLoading(false);
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        logoutStorage();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
