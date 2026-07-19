import type { AxiosInstance } from "axios";
import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    plan: string;
    emailVerified: boolean;
    analysisCount?: number;
}

interface AppContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    api: AxiosInstance;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string; emailVerified?: boolean }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; emailVerified?: boolean }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
    resendVerification: () => Promise<{ success: boolean; message: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
    resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const api = axios.create({ baseURL: BACKEND_URL });

api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) config.headers.Authorization = `Bearer ${storedToken}`;
    return config;
});

const AppContext = createContext<AppContextType | undefined>(undefined);
const getApiError = (error: unknown, fallback: string) => axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;

export function AppProvider({ children }: { children: ReactNode }){
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);
    const refreshUser = async () => {
        if(!token){
            setLoading(false);
            return;
        }
        try {
            const {data} = await api.get('/api/auth/user');
            if(data.success){
                setUser(data.user);
            }
        } catch {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
        setLoading(false);
    }

    useEffect(() => {
        refreshUser();
    }, []);

    const updateAuthState = (res: { data: { success: boolean; token: string; user: User } }) => {
        if(res.data.success){
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem("token", res.data.token);
            return { success: true as const, emailVerified: res.data.user.emailVerified };
        }
        return { success: false as const, message: "Unexpected error" };
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {email, password});
            if(res.data.success){
                const result = updateAuthState(res);
                return { ...result, message: undefined };
            }
            return { success: false as const, message: res.data.message };
        } catch (error: unknown) {
            return { success: false as const, message: getApiError(error, "Login failed") };
        }
    }

    const register = async (name: string, email: string, password: string) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {name, email, password});
            if(res.data.success){
                const result = updateAuthState(res);
                return { ...result, message: undefined };
            }
            return { success: false as const, message: res.data.message };
        } catch (error: unknown) {
            return { success: false as const, message: getApiError(error, "Registration failed") };
        }
    }

    const logout = async () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    }

    const verifyEmail = async (token: string) => {
        try {
            const { data } = await axios.get(`${BACKEND_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
            if (data.success) {
                setUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
            }
            return { success: data.success, message: data.message };
        } catch (error: unknown) {
            return { success: false, message: getApiError(error, "Verification failed") };
        }
    };

    const resendVerification = async () => {
        try {
            const { data } = await api.post("/api/auth/resend-verification");
            return { success: data.success, message: data.message };
        } catch (error: unknown) {
            return { success: false, message: getApiError(error, "Failed to resend verification") };
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, { email });
            return { success: data.success, message: data.message };
        } catch (error: unknown) {
            return { success: false, message: getApiError(error, "Failed to send reset email") };
        }
    };

    const resetPassword = async (token: string, password: string) => {
        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, { token, password });
            return { success: data.success, message: data.message };
        } catch (error: unknown) {
            return { success: false, message: getApiError(error, "Password reset failed") };
        }
    };

    const value = {user, token, loading, api, login, register, logout, refreshUser, verifyEmail, resendVerification, forgotPassword, resetPassword};
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(){
    const context = useContext(AppContext);
    if(!context) throw new Error("useApp must be used within AppProvider");
    return context;
}
