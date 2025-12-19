import { supabase } from '../lib/supabase';
import { ScheduleBlock, ActivityType } from '../types';

// Default schedule for new users
export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
    { id: '1', start: '06:00', end: '07:00', activity: 'Morning Routine', type: ActivityType.WORKOUT },
    { id: '2', start: '09:00', end: '12:00', activity: 'Work / Study', type: ActivityType.DEEP_STUDY },
    { id: '3', start: '14:00', end: '17:00', activity: 'Work / Study', type: ActivityType.STUDY },
    { id: '4', start: '18:00', end: '19:00', activity: 'Exercise', type: ActivityType.WALK },
];

export interface UserSchedule {
    id?: string;
    user_id: string;
    schedule: ScheduleBlock[];
    created_at?: string;
    updated_at?: string;
}

/**
 * Get user's custom schedule from database
 */
export const getUserSchedule = async (userId: string): Promise<ScheduleBlock[] | null> => {
    try {
        const { data, error } = await supabase
            .from('user_schedules')
            .select('schedule')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No schedule found - user needs to create one
                return null;
            }
            console.error('Error fetching schedule:', error);
            return null;
        }

        return data?.schedule || null;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return null;
    }
};

/**
 * Save or update user's schedule
 */
export const saveUserSchedule = async (userId: string, schedule: ScheduleBlock[]): Promise<boolean> => {
    try {
        // Check if schedule exists
        const { data: existing } = await supabase
            .from('user_schedules')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Update existing schedule
            const { error } = await supabase
                .from('user_schedules')
                .update({
                    schedule,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            // Insert new schedule
            const { error } = await supabase
                .from('user_schedules')
                .insert([{
                    user_id: userId,
                    schedule
                }]);

            if (error) throw error;
        }

        console.log('✅ Schedule saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving schedule:', error);
        return false;
    }
};

/**
 * Delete user's schedule
 */
export const deleteUserSchedule = async (userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_schedules')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return false;
    }
};

/**
 * Parse a timetable text into schedule blocks
 */
export const parseTimetableText = (text: string): ScheduleBlock[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const schedule: ScheduleBlock[] = [];

    lines.forEach((line, index) => {
        // Try to match patterns like "6:00 - 7:00 Morning Workout" or "06:00-07:00: Study"
        const timePattern = /(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})[:\s]*(.+)/i;
        const match = line.match(timePattern);

        if (match) {
            const [, start, end, activity] = match;
            const activityTrimmed = activity.trim();

            // Auto-detect activity type
            let type = ActivityType.STUDY;
            const lowerActivity = activityTrimmed.toLowerCase();

            if (lowerActivity.includes('workout') || lowerActivity.includes('gym') || lowerActivity.includes('exercise')) {
                type = ActivityType.WORKOUT;
            } else if (lowerActivity.includes('class') || lowerActivity.includes('lecture')) {
                type = ActivityType.CLASS;
            } else if (lowerActivity.includes('deep') || lowerActivity.includes('focus')) {
                type = ActivityType.DEEP_STUDY;
            } else if (lowerActivity.includes('walk') || lowerActivity.includes('break') || lowerActivity.includes('rest')) {
                type = ActivityType.WALK;
            }

            schedule.push({
                id: `custom-${index + 1}`,
                start: start.padStart(5, '0'),
                end: end.padStart(5, '0'),
                activity: activityTrimmed,
                type
            });
        }
    });

    // Sort by start time
    schedule.sort((a, b) => a.start.localeCompare(b.start));

    return schedule;
};

/**
 * Validate schedule blocks
 */
export const validateSchedule = (schedule: ScheduleBlock[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (schedule.length === 0) {
        errors.push('Schedule must have at least one activity');
        return { valid: false, errors };
    }

    schedule.forEach((block, index) => {
        // Check time format
        if (!/^\d{2}:\d{2}$/.test(block.start) || !/^\d{2}:\d{2}$/.test(block.end)) {
            errors.push(`Activity ${index + 1}: Invalid time format`);
        }

        // Check start < end
        if (block.start >= block.end) {
            errors.push(`Activity ${index + 1}: End time must be after start time`);
        }

        // Check activity name
        if (!block.activity || block.activity.trim().length === 0) {
            errors.push(`Activity ${index + 1}: Activity name is required`);
        }
    });

    // Check for overlapping times
    for (let i = 0; i < schedule.length - 1; i++) {
        if (schedule[i].end > schedule[i + 1].start) {
            errors.push(`Activities ${i + 1} and ${i + 2} have overlapping times`);
        }
    }

    return { valid: errors.length === 0, errors };
};
