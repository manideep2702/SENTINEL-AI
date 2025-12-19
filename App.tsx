import React, { useEffect, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScheduleProvider, useSchedule } from './contexts/ScheduleContext';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VerifyUploadPage } from './pages/VerifyUploadPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { ScheduleEditor } from './components/ScheduleEditor';
import { fetchTodayVerifications, VerificationRecord } from './services/verificationService';
import { initializeTaskReminders, clearAllReminders, checkAndSendDailyAnalysis } from './services/notificationService';

// Inner component that has access to auth and schedule context
const AppContent: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { schedule, isLoading: scheduleLoading, hasSchedule, setSchedule } = useSchedule();
    const [logs, setLogs] = useState<Record<string, { result: any }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [dailyReportSent, setDailyReportSent] = useState(false);
    const [showScheduleEditor, setShowScheduleEditor] = useState(false);

    // Load verification history from Supabase
    const loadVerificationHistory = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            const verifications = await fetchTodayVerifications(user.id);

            // Convert to logs format
            const loadedLogs: Record<string, { result: any }> = {};
            verifications.forEach((v: VerificationRecord) => {
                loadedLogs[v.block_id] = {
                    result: {
                        task_verified: v.task_verified,
                        focus_score: v.focus_score,
                        distractions_detected: v.distractions_detected,
                        ai_critique: v.ai_critique
                    }
                };
            });

            setLogs(loadedLogs);
            console.log(`✅ Loaded ${verifications.length} verifications from backend`);
        } catch (error) {
            console.error('Failed to load verification history:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Load history when user changes
    useEffect(() => {
        loadVerificationHistory();
    }, [loadVerificationHistory]);

    // Initialize task reminders when user logs in and has schedule
    useEffect(() => {
        if (user && hasSchedule && schedule.length > 0) {
            // Initialize reminders with user's email
            initializeTaskReminders(
                user.id,
                user.email || null,
                user.user_metadata?.full_name || user.email?.split('@')[0] || null
            );
            console.log('🔔 Task reminders initialized with custom schedule');
        }

        // Cleanup reminders on logout or unmount
        return () => {
            clearAllReminders();
        };
    }, [user, hasSchedule, schedule]);

    const handleVerificationComplete = async (blockId: string, result: any) => {
        const newLogs = { ...logs, [blockId]: { result } };
        setLogs(newLogs);

        // Check if all tasks are completed and send daily analysis
        if (user && !dailyReportSent) {
            const sent = await checkAndSendDailyAnalysis(
                newLogs,
                user.email || null,
                user.user_metadata?.full_name || user.email?.split('@')[0] || null
            );
            if (sent) {
                setDailyReportSent(true);
            }
        }
    };

    const handleScheduleSave = (newSchedule: any[]) => {
        setSchedule(newSchedule);
        setShowScheduleEditor(false);
    };

    // Show loading state
    if (authLoading || scheduleLoading) {
        return (
            <div className="min-h-screen bg-[#020204] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <iconify-icon icon="lucide:loader-2" width="32" className="text-purple-500 animate-spin"></iconify-icon>
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Show schedule setup for first-time logged-in users
    if (user && !hasSchedule && !scheduleLoading) {
        return (
            <div className="min-h-screen bg-[#020204]">
                <ScheduleEditor
                    userId={user.id}
                    currentSchedule={[]}
                    onSave={handleScheduleSave}
                    onClose={() => { }}
                    isFirstTime={true}
                />
            </div>
        );
    }

    return (
        <>
            <Routes>
                <Route path="/" element={
                    <HomePage
                        logs={logs}
                        onVerificationComplete={handleVerificationComplete}
                        onEditSchedule={() => setShowScheduleEditor(true)}
                    />
                } />
                <Route path="/verify" element={<VerifyUploadPage logs={logs} onVerificationComplete={handleVerificationComplete} />} />
                <Route path="/analytics" element={<AnalyticsPage logs={logs} />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
            </Routes>

            {/* Schedule Editor Modal */}
            {showScheduleEditor && user && (
                <ScheduleEditor
                    userId={user.id}
                    currentSchedule={schedule}
                    onSave={handleScheduleSave}
                    onClose={() => setShowScheduleEditor(false)}
                    isFirstTime={false}
                />
            )}
        </>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <ScheduleProvider>
                    <AppContent />
                </ScheduleProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;