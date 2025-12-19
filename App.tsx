import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VerifyUploadPage } from './pages/VerifyUploadPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { fetchTodayVerifications, VerificationRecord } from './services/verificationService';
import { initializeTaskReminders, clearAllReminders, checkAndSendDailyAnalysis } from './services/notificationService';

// Inner component that has access to auth context
const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = React.useState<Record<string, { result: any }>>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [dailyReportSent, setDailyReportSent] = React.useState(false);

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

    // Initialize task reminders when user logs in
    useEffect(() => {
        if (user) {
            // Initialize reminders with user's email
            initializeTaskReminders(
                user.id,
                user.email || null,
                user.user_metadata?.full_name || user.email?.split('@')[0] || null
            );
            console.log('🔔 Task reminders initialized');
        }

        // Cleanup reminders on logout or unmount
        return () => {
            clearAllReminders();
        };
    }, [user]);

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

    return (
        <Routes>
            <Route path="/" element={<HomePage logs={logs} onVerificationComplete={handleVerificationComplete} />} />
            <Route path="/verify" element={<VerifyUploadPage logs={logs} onVerificationComplete={handleVerificationComplete} />} />
            <Route path="/analytics" element={<AnalyticsPage logs={logs} />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;