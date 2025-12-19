import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScheduleBlock } from '../types';
import { getUserSchedule, DEFAULT_SCHEDULE } from '../services/scheduleService';
import { useAuth } from './AuthContext';

interface ScheduleContextType {
    schedule: ScheduleBlock[];
    isLoading: boolean;
    hasSchedule: boolean;
    setSchedule: (schedule: ScheduleBlock[]) => void;
    refreshSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState<ScheduleBlock[]>(DEFAULT_SCHEDULE);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSchedule, setHasSchedule] = useState(false);

    const loadSchedule = async () => {
        if (!user) {
            // Use default schedule for non-logged-in users
            setSchedule(DEFAULT_SCHEDULE);
            setIsLoading(false);
            setHasSchedule(false);
            return;
        }

        setIsLoading(true);
        try {
            const userSchedule = await getUserSchedule(user.id);
            if (userSchedule && userSchedule.length > 0) {
                setSchedule(userSchedule);
                setHasSchedule(true);
            } else {
                // No schedule found - user needs to create one
                setSchedule([]);
                setHasSchedule(false);
            }
        } catch (error) {
            console.error('Failed to load schedule:', error);
            setSchedule(DEFAULT_SCHEDULE);
            setHasSchedule(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadSchedule();
    }, [user]);

    const handleSetSchedule = (newSchedule: ScheduleBlock[]) => {
        setSchedule(newSchedule);
        setHasSchedule(true);
    };

    return (
        <ScheduleContext.Provider value={{
            schedule,
            isLoading,
            hasSchedule,
            setSchedule: handleSetSchedule,
            refreshSchedule: loadSchedule
        }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (context === undefined) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
};
