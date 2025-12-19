import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjscgwtpzoacwtjdyzep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqc2Nnd3Rwem9hY3d0amR5emVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDU0ODAsImV4cCI6MjA4MTY4MTQ4MH0.PUpOr3bSSC8A5r96QHRueR8H_l9GRHxv6LTTUcvJrmk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google Sign In
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('Error signing in with Google:', error.message);
        throw error;
    }

    return data;
};

// Email Sign In
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
};

// Email Sign Up
export const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) {
        throw error;
    }

    return data;
};

// Sign Out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
};

// Get current user
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Get session
export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};
