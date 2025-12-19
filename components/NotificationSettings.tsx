import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    getNotificationPreferences,
    saveNotificationPreferences,
    requestNotificationPermission,
    NotificationPreferences
} from '../services/notificationService';

interface NotificationSettingsProps {
    onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [minutesBefore, setMinutesBefore] = useState(5);
    const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Load preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            if (!user) return;

            try {
                const prefs = await getNotificationPreferences(user.id);
                if (prefs) {
                    setEmailEnabled(prefs.email_reminders_enabled);
                    setPushEnabled(prefs.push_notifications_enabled);
                    setMinutesBefore(prefs.reminder_minutes_before);
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();

        // Check push notification permission
        if ('Notification' in window) {
            setPushPermission(Notification.permission);
        }
    }, [user]);

    const handleRequestPermission = async () => {
        const granted = await requestNotificationPermission();
        setPushPermission(granted ? 'granted' : 'denied');
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setSaveMessage(null);

        try {
            await saveNotificationPreferences({
                user_id: user.id,
                email_reminders_enabled: emailEnabled,
                push_notifications_enabled: pushEnabled,
                reminder_minutes_before: minutesBefore
            });

            setSaveMessage('✅ Settings saved successfully!');
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setSaveMessage('❌ Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                    <iconify-icon icon="lucide:bell-off" width="48" className="text-slate-500 mb-4"></iconify-icon>
                    <h3 className="text-xl font-semibold text-white mb-2">Sign In Required</h3>
                    <p className="text-slate-400 text-sm mb-6">Please sign in to manage your notification preferences.</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <iconify-icon icon="lucide:bell" width="20" className="text-purple-400"></iconify-icon>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
                            <p className="text-xs text-slate-500">Configure your task reminders</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <iconify-icon icon="lucide:x" width="16" className="text-slate-400"></iconify-icon>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <iconify-icon icon="lucide:loader-2" width="24" className="text-purple-400 animate-spin"></iconify-icon>
                        </div>
                    ) : (
                        <>
                            {/* Email Reminders */}
                            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <iconify-icon icon="lucide:mail" width="16" className="text-blue-400"></iconify-icon>
                                        <span className="text-sm font-medium text-white">Email Reminders</span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Receive email notifications before your scheduled tasks
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEmailEnabled(!emailEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${emailEnabled ? 'bg-purple-600' : 'bg-white/10'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailEnabled ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Push Notifications */}
                            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <iconify-icon icon="lucide:bell-ring" width="16" className="text-emerald-400"></iconify-icon>
                                        <span className="text-sm font-medium text-white">Browser Notifications</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">
                                        Get push notifications when the app is open
                                    </p>
                                    {pushPermission === 'denied' && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <iconify-icon icon="lucide:alert-circle" width="12"></iconify-icon>
                                            Permission denied. Enable in browser settings.
                                        </p>
                                    )}
                                    {pushPermission === 'default' && pushEnabled && (
                                        <button
                                            onClick={handleRequestPermission}
                                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                                        >
                                            <iconify-icon icon="lucide:unlock" width="12"></iconify-icon>
                                            Click to enable permission
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setPushEnabled(!pushEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${pushEnabled ? 'bg-purple-600' : 'bg-white/10'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${pushEnabled ? 'left-7' : 'left-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Reminder Timing */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <iconify-icon icon="lucide:clock" width="16" className="text-orange-400"></iconify-icon>
                                    <span className="text-sm font-medium text-white">Reminder Timing</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">
                                    How many minutes before each task should we send a reminder?
                                </p>
                                <div className="flex items-center gap-4">
                                    {[5, 10, 15, 30].map((mins) => (
                                        <button
                                            key={mins}
                                            onClick={() => setMinutesBefore(mins)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${minutesBefore === mins
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {mins} min
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Message */}
                            {saveMessage && (
                                <div className={`text-sm text-center py-2 rounded-lg ${saveMessage.includes('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {saveMessage}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading || isSaving}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        {isSaving ? (
                            <>
                                <iconify-icon icon="lucide:loader-2" width="14" className="animate-spin"></iconify-icon>
                                Saving...
                            </>
                        ) : (
                            <>
                                <iconify-icon icon="lucide:check" width="14"></iconify-icon>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
