import { supabase } from '../lib/supabase';
import { DAILY_SCHEDULE } from '../constants';
import { ScheduleBlock } from '../types';
import emailjs from '@emailjs/browser';

// EmailJS Configuration (set in .env.local)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Gmail Configuration (for reference - requires backend)
const GMAIL_USER = import.meta.env.VITE_GMAIL_USER || '';

// Types for notification preferences
export interface NotificationPreferences {
    id?: string;
    user_id: string;
    email_reminders_enabled: boolean;
    reminder_minutes_before: number; // Default: 5
    push_notifications_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

// Store active timers for cleanup
let activeTimers: NodeJS.Timeout[] = [];

/**
 * Get the next scheduled task based on current time
 */
export const getNextTask = (): { task: ScheduleBlock | null; minutesUntil: number } => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const block of DAILY_SCHEDULE) {
        const [startH, startM] = block.start.split(':').map(Number);
        const startMinutes = startH * 60 + startM;

        if (startMinutes > currentMinutes) {
            return {
                task: block,
                minutesUntil: startMinutes - currentMinutes
            };
        }
    }

    // No more tasks today, return first task for tomorrow
    if (DAILY_SCHEDULE.length > 0) {
        const firstTask = DAILY_SCHEDULE[0];
        const [startH, startM] = firstTask.start.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const minutesUntilMidnight = (24 * 60) - currentMinutes;

        return {
            task: firstTask,
            minutesUntil: minutesUntilMidnight + startMinutes
        };
    }

    return { task: null, minutesUntil: -1 };
};

/**
 * Get all upcoming tasks for today
 */
export const getUpcomingTasks = (): { task: ScheduleBlock; minutesUntil: number }[] => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming: { task: ScheduleBlock; minutesUntil: number }[] = [];

    for (const block of DAILY_SCHEDULE) {
        const [startH, startM] = block.start.split(':').map(Number);
        const startMinutes = startH * 60 + startM;

        if (startMinutes > currentMinutes) {
            upcoming.push({
                task: block,
                minutesUntil: startMinutes - currentMinutes
            });
        }
    }

    return upcoming;
};

/**
 * Save notification preferences to database
 */
export const saveNotificationPreferences = async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
    const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
            user_id: prefs.user_id,
            email_reminders_enabled: prefs.email_reminders_enabled,
            reminder_minutes_before: prefs.reminder_minutes_before,
            push_notifications_enabled: prefs.push_notifications_enabled
        }, {
            onConflict: 'user_id'
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving notification preferences:', error);
        throw error;
    }

    return data as NotificationPreferences;
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching notification preferences:', error);
        throw error;
    }

    return data as NotificationPreferences | null;
};

/**
 * Send email reminder
 * Priority: 1. Local email server (Gmail SMTP) 2. EmailJS 3. Log only
 */
export const sendEmailReminder = async (
    userEmail: string,
    userName: string,
    taskName: string,
    taskTime: string,
    minutesBefore: number
): Promise<boolean> => {
    // Skip localhost check if not in development
    const isDevelopment = window.location.hostname === 'localhost';

    if (isDevelopment) {
        // Try local email server first (Gmail SMTP via backend) - only in development
        try {
            const response = await fetch('http://localhost:3001/api/send-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    userName: userName || 'User',
                    taskName: taskName,
                    taskTime: taskTime,
                    minutesBefore: minutesBefore
                })
            });

            if (response.ok) {
                console.log('✅ Email sent via Gmail SMTP server');
                return true;
            }
        } catch (serverErr) {
            console.log('📧 Local email server not running, trying EmailJS...');
        }
    }

    // Try EmailJS (works in production)
    try {
        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
            const templateParams = {
                to_email: userEmail,
                to_name: userName || 'User',
                task_name: taskName,
                task_time: taskTime,
                minutes_before: minutesBefore.toString(),
                app_url: window.location.origin
            };

            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            console.log('✅ Email sent via EmailJS:', response.status);
            return true;
        } else {
            console.warn('⚠️ EmailJS not configured');
            console.log('📧 To enable email reminders, set up EmailJS:');
            console.log('   1. Sign up at https://www.emailjs.com');
            console.log('   2. Add VITE_EMAILJS_* variables to .env.local');
            console.log('   3. See docs/EMAILJS_SETUP.md for details');
        }
    } catch (emailjsErr) {
        console.error('❌ EmailJS failed:', emailjsErr);
    }

    // Log what would have been sent
    console.log(`📧 Email reminder: ${userEmail} - ${taskName} at ${taskTime}`);
    return true; // Return true to continue with browser notification
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('Browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

/**
 * Show browser notification
 */
export const showBrowserNotification = (title: string, body: string, icon?: string): void => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/Sentinellogo.jpg',
            badge: '/Sentinellogo.jpg',
            tag: 'task-reminder',
            requireInteraction: true
        });
    }
};

/**
 * Schedule a reminder for a specific task
 */
export const scheduleTaskReminder = (
    task: ScheduleBlock,
    minutesBefore: number,
    userEmail: string | null,
    userName: string | null,
    emailEnabled: boolean,
    pushEnabled: boolean
): NodeJS.Timeout | null => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = task.start.split(':').map(Number);
    const taskStartMinutes = startH * 60 + startM;

    // Calculate when to send reminder
    const reminderMinutes = taskStartMinutes - minutesBefore;
    const minutesUntilReminder = reminderMinutes - currentMinutes;

    // If reminder time has passed, skip
    if (minutesUntilReminder <= 0) {
        return null;
    }

    const msUntilReminder = minutesUntilReminder * 60 * 1000;

    console.log(`⏰ Scheduling reminder for "${task.activity}" in ${minutesUntilReminder} minutes`);

    const timerId = setTimeout(async () => {
        console.log(`🔔 Reminder triggered for: ${task.activity}`);

        // Send browser notification if enabled
        if (pushEnabled) {
            showBrowserNotification(
                `⏰ ${task.activity} in ${minutesBefore} minutes!`,
                `Get ready! Your ${task.activity} session starts at ${task.start}.`,
            );
        }

        // Send email if enabled and user has email
        if (emailEnabled && userEmail) {
            await sendEmailReminder(
                userEmail,
                userName || 'User',
                task.activity,
                task.start,
                minutesBefore
            );
        }
    }, msUntilReminder);

    activeTimers.push(timerId);
    return timerId;
};

/**
 * Initialize all task reminders for the day
 */
export const initializeTaskReminders = async (
    userId: string,
    userEmail: string | null,
    userName: string | null
): Promise<void> => {
    // Clear any existing timers
    clearAllReminders();

    // Get user preferences
    let prefs = await getNotificationPreferences(userId);

    // If no preferences, use defaults
    if (!prefs) {
        prefs = {
            user_id: userId,
            email_reminders_enabled: true,
            reminder_minutes_before: 5,
            push_notifications_enabled: true
        };
    }

    // Request notification permission if push is enabled
    if (prefs.push_notifications_enabled) {
        await requestNotificationPermission();
    }

    // Get upcoming tasks
    const upcomingTasks = getUpcomingTasks();

    console.log(`📅 Scheduling reminders for ${upcomingTasks.length} upcoming tasks`);

    // Schedule reminder for each upcoming task
    for (const { task } of upcomingTasks) {
        scheduleTaskReminder(
            task,
            prefs.reminder_minutes_before,
            userEmail,
            userName,
            prefs.email_reminders_enabled,
            prefs.push_notifications_enabled
        );
    }
};

/**
 * Clear all active reminders
 */
export const clearAllReminders = (): void => {
    activeTimers.forEach(timer => clearTimeout(timer));
    activeTimers = [];
    console.log('🧹 Cleared all active reminders');
};

/**
 * Format time until task in human-readable form
 */
export const formatTimeUntil = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours}h ${remainingMinutes}m`;
};

/**
 * Check if all tasks for today are completed
 */
export const areAllTasksCompleted = (logs: Record<string, { result: any }>): boolean => {
    const totalTasks = DAILY_SCHEDULE.length;
    const completedTasks = Object.keys(logs).length;
    return completedTasks >= totalTasks;
};

/**
 * Get completion statistics for the day
 */
export const getDailyStats = (logs: Record<string, { result: any }>): {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgFocusScore: number;
    tasks: Array<{ name: string; time: string; verified: boolean; focusScore: number }>;
} => {
    const totalTasks = DAILY_SCHEDULE.length;
    const completedIds = Object.keys(logs);
    const completedTasks = completedIds.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let totalFocusScore = 0;
    const tasks = DAILY_SCHEDULE.map(block => {
        const log = logs[block.id];
        const focusScore = log?.result?.focus_score || 0;
        totalFocusScore += focusScore;

        return {
            name: block.activity,
            time: `${block.start} - ${block.end}`,
            verified: !!log?.result?.task_verified,
            focusScore: focusScore
        };
    });

    const avgFocusScore = completedTasks > 0 ? Math.round(totalFocusScore / completedTasks) : 0;

    return {
        totalTasks,
        completedTasks,
        completionRate,
        avgFocusScore,
        tasks
    };
};

/**
 * Send daily analysis email
 */
export const sendDailyAnalysisEmail = async (
    userEmail: string,
    userName: string,
    logs: Record<string, { result: any }>
): Promise<boolean> => {
    try {
        const stats = getDailyStats(logs);
        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const response = await fetch('http://localhost:3001/api/send-daily-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: userEmail,
                userName: userName,
                tasks: stats.tasks,
                date: today
            })
        });

        if (response.ok) {
            console.log('✅ Daily analysis email sent successfully');
            return true;
        } else {
            console.error('Failed to send daily analysis email');
            return false;
        }
    } catch (err) {
        console.error('Error sending daily analysis email:', err);
        return false;
    }
};

/**
 * Check and send daily analysis if all tasks are complete
 * Call this after each task verification
 */
export const checkAndSendDailyAnalysis = async (
    logs: Record<string, { result: any }>,
    userEmail: string | null,
    userName: string | null
): Promise<boolean> => {
    // Check if all tasks are completed
    if (!areAllTasksCompleted(logs)) {
        console.log(`📊 ${Object.keys(logs).length}/${DAILY_SCHEDULE.length} tasks completed. Waiting for all tasks.`);
        return false;
    }

    // All tasks completed!
    if (userEmail) {
        console.log('🎉 All tasks completed! Sending daily analysis email...');

        // Show browser notification
        if (Notification.permission === 'granted') {
            new Notification('🎉 All Tasks Completed!', {
                body: 'Check your email for your daily performance report.',
                icon: '/Sentinellogo.jpg',
                tag: 'daily-complete'
            });
        }

        return await sendDailyAnalysisEmail(userEmail, userName || 'User', logs);
    }

    return false;
};
