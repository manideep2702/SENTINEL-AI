import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { NotificationSettings } from '../components/NotificationSettings';

interface HomePageProps {
    logs: Record<string, { result: any }>;
    onVerificationComplete: (blockId: string, result: any) => void;
    onEditSchedule?: () => void;
}

// Counter animation hook
const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return count;
};

// Stats Counter Component
const StatCounter: React.FC<{ value: number; suffix?: string; label: string; icon: string }> = ({ value, suffix = '', label, icon }) => {
    const count = useCounter(value);
    return (
        <div className="text-center slide-in-up">
            <div className="flex items-center justify-center gap-2 mb-2">
                <iconify-icon icon={icon} width="20" className="text-purple-400"></iconify-icon>
                <span className="text-3xl md:text-4xl font-bold text-white counter-value">{count}{suffix}</span>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
    );
};

export const HomePage: React.FC<HomePageProps> = ({ logs, onEditSchedule }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { schedule } = useSchedule();
    const [isLoaded, setIsLoaded] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);

    useEffect(() => {
        setIsLoaded(true);

        // Mouse tracking for spotlight
        const handleMouseMove = (e: MouseEvent) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const completedTasks = Object.values(logs).filter((l: any) => l.result?.task_verified).length;

    return (
        <div className="min-h-screen text-slate-400 selection:bg-purple-500/30 selection:text-purple-200">

            {/* Background Layers */}
            <div className="fixed z-0 pointer-events-none top-0 right-0 bottom-0 left-0">
                <div className="spotlight-bg"></div>
                <div className="absolute inset-0 tech-grid opacity-25"></div>
                <div className="absolute inset-0 dot-matrix opacity-30"></div>
                <div className="falling-lines">
                    <div className="falling-line" style={{ left: '8%', animationDuration: '5s', animationDelay: '0s' }}></div>
                    <div className="falling-line" style={{ left: '22%', animationDuration: '8s', animationDelay: '1.5s' }}></div>
                    <div className="falling-line" style={{ left: '42%', animationDuration: '6s', animationDelay: '2.5s' }}></div>
                    <div className="falling-line" style={{ left: '62%', animationDuration: '7s', animationDelay: '0.8s' }}></div>
                    <div className="falling-line" style={{ left: '82%', animationDuration: '9s', animationDelay: '3.5s' }}></div>
                </div>
                {/* Enhanced Floating Orbs */}
                <div className="ambient-orb ambient-orb-1"></div>
                <div className="ambient-orb ambient-orb-2"></div>
                <div className="ambient-orb ambient-orb-3"></div>
                {/* Floating Particles */}
                <div className="floating-particles">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="particle" style={{ left: `${10 + i * 8}%`, bottom: `${5 + (i % 4) * 15}%`, animationDelay: `${i * 1.5}s` }}></div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 border-b bg-[#020204]/80 backdrop-blur-xl border-white/5 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-lg tracking-tight font-bold text-white">SENTINEL AI</span>
                </div>

                <div className="hidden md:flex items-center gap-1 p-1 rounded-full border backdrop-blur-md bg-white/5 border-white/10">
                    <button onClick={() => scrollToSection('features')} className="px-4 py-1.5 text-xs rounded-full transition-all text-slate-300 hover:text-white hover:bg-white/10 active:scale-95">Features</button>
                    <button onClick={() => navigate('/verify')} className="px-4 py-1.5 text-xs rounded-full transition-all text-slate-300 hover:text-white hover:bg-white/10 active:scale-95">Verify</button>
                    <button onClick={() => navigate('/analytics')} className="px-4 py-1.5 text-xs rounded-full transition-all text-slate-300 hover:text-white hover:bg-white/10 active:scale-95">Analytics</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="px-4 py-1.5 text-xs rounded-full transition-all text-slate-300 hover:text-white hover:bg-white/10 active:scale-95">How It Works</button>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                    <img
                                        src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email?.charAt(0)}&background=a855f7&color=fff`}
                                        alt="Profile"
                                        className="w-7 h-7 rounded-full object-cover border border-purple-500/30"
                                    />
                                    <span className="text-xs text-slate-300 hidden sm:block">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </span>
                                    <iconify-icon icon="lucide:chevron-down" width="14" className="text-slate-400"></iconify-icon>
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#0a0a0c] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="px-3 py-2 border-b border-white/10">
                                        <p className="text-xs text-slate-400">Signed in as</p>
                                        <p className="text-sm text-white truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/verify')}
                                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                    >
                                        <iconify-icon icon="lucide:upload" width="14"></iconify-icon>
                                        Verify Task
                                    </button>
                                    <button
                                        onClick={() => navigate('/analytics')}
                                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                    >
                                        <iconify-icon icon="lucide:bar-chart-2" width="14"></iconify-icon>
                                        Analytics
                                    </button>
                                    <button
                                        onClick={() => setShowNotificationSettings(true)}
                                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                    >
                                        <iconify-icon icon="lucide:bell" width="14"></iconify-icon>
                                        Notification Settings
                                    </button>
                                    <button
                                        onClick={() => onEditSchedule?.()}
                                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                    >
                                        <iconify-icon icon="lucide:calendar-cog" width="14"></iconify-icon>
                                        Edit Schedule
                                    </button>
                                    <div className="border-t border-white/10 my-1"></div>
                                    <button
                                        onClick={signOut}
                                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                    >
                                        <iconify-icon icon="lucide:log-out" width="14"></iconify-icon>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/signup')}
                            className="group relative text-xs font-semibold bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-lg transition-all overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Sign Up
                                <iconify-icon icon="lucide:arrow-right" width="14"></iconify-icon>
                            </span>
                        </button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="min-h-screen flex flex-col overflow-hidden w-full z-10 pt-32 pb-20 relative items-center">

                {/* Hero Content */}
                <div className="text-center max-w-5xl z-20 mx-auto px-6 relative">

                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-[11px] font-medium mb-8 shadow-[0_0_30px_rgba(168,85,247,0.2)] text-purple-200 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-purple-400"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span>AI-Powered Accountability Engine</span>
                        <span className="text-purple-400">•</span>
                        <span className="text-purple-300">Powered by SENTINEL AI</span>
                    </div>

                    {/* Main Heading - Enhanced Typography */}
                    <h1 className={`md:text-7xl lg:text-8xl leading-[0.95] text-5xl font-medium text-white tracking-tight font-serif mb-10 hero-headline transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        Where ambition <br />
                        <span className="gradient-text-animate font-serif italic">becomes evidence.</span>
                    </h1>

                    {/* Subheading - WCAG AAA Compliant */}
                    <p className={`leading-[1.8] text-lg md:text-xl max-w-2xl mx-auto mb-14 font-normal text-slate-300 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        Verify your daily routine with AI-powered analysis. High-leverage tracking for high-performance minds.
                        <span className="text-white font-semibold"> Zero excuses. Zero compromises.</span>
                    </p>

                    {/* Enhanced CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-5 mb-16 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <button
                            onClick={() => navigate('/verify')}
                            className="btn-primary group"
                        >
                            <span className="btn-text">
                                <iconify-icon icon="lucide:play" width="20"></iconify-icon>
                                Start Verification
                                <iconify-icon icon="lucide:arrow-right" width="18" className="btn-icon"></iconify-icon>
                            </span>
                        </button>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="btn-secondary group"
                        >
                            <iconify-icon icon="lucide:info" width="18"></iconify-icon>
                            Learn How It Works
                        </button>
                    </div>

                    {/* Stats Section - Mobile Responsive */}
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-xl mx-auto mb-20 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <StatCounter value={99} suffix="%" label="Accuracy" icon="lucide:target" />
                        <StatCounter value={completedTasks || 24} suffix="" label="Tasks Verified" icon="lucide:check-circle" />
                        <StatCounter value={10} suffix="x" label="Productivity" icon="lucide:zap" />
                    </div>
                </div>

                {/* Demo Preview Card */}
                <div className={`dashboard-container w-full max-w-5xl z-20 mx-auto px-4 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="dashboard-ui relative w-full rounded-2xl border bg-[#0a0a0c] overflow-hidden shadow-2xl border-white/10">
                        <div className="scanline"></div>

                        {/* Mock Header */}
                        <div className="h-12 border-b bg-white/[0.02] flex items-center px-4 justify-between select-none border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50 shimmer"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50 shimmer"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50 shimmer"></div>
                                </div>
                                <div className="h-5 w-px mx-2 bg-white/10"></div>
                                <div className="flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border bg-black/40 border-white/5 text-slate-400">
                                    <iconify-icon icon="lucide:shield-check" width="12"></iconify-icon>
                                    <span className="font-mono">vertex-dashboard</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    AI: ACTIVE
                                </div>
                            </div>
                        </div>

                        {/* Mock Dashboard Content - Enhanced Cards */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="dashboard-card shimmer">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                        <iconify-icon icon="lucide:brain" width="24"></iconify-icon>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">AI Analysis</h3>
                                        <p className="text-xs text-slate-400">Real-time verification</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2 counter-value">SENTINEL AI</div>
                                <p className="text-sm text-slate-300">Flash Processing</p>
                            </div>

                            {/* Card 2 */}
                            <div className="dashboard-card shimmer">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        <iconify-icon icon="lucide:check-circle-2" width="24"></iconify-icon>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Verified Today</h3>
                                        <p className="text-xs text-slate-400">Completed activities</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-3 counter-value">{completedTasks || 6}/6</div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${((completedTasks || 6) / 6) * 100}%` }}></div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="dashboard-card shimmer">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        <iconify-icon icon="lucide:flame" width="24"></iconify-icon>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Focus Score</h3>
                                        <p className="text-xs text-slate-400">Average performance</p>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2 counter-value">9.2/10</div>
                                <p className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                                    <iconify-icon icon="lucide:trending-up" width="14"></iconify-icon>
                                    15% from yesterday
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizon Ring Effect */}
                <div className="absolute w-[200vw] h-[200vw] rounded-full border border-white/5 left-1/2 bottom-[-180vw] -translate-x-1/2 shadow-[0_-60px_150px_-30px_rgba(168,85,247,0.25)] pointer-events-none z-10"></div>
            </main>

            {/* Features Section */}
            <section id="features" className="relative py-32 bg-[#020204] overflow-hidden border-t border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium mb-6 text-slate-300">
                            <iconify-icon icon="lucide:sparkles" width="14" className="text-purple-400"></iconify-icon>
                            CORE INFRASTRUCTURE
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 font-serif text-white hero-headline">
                            Built for the <span className="gradient-text-animate italic">relentless.</span>
                        </h2>
                        <p className="text-lg md:text-xl leading-[1.75] font-normal text-slate-300 max-w-2xl mx-auto">
                            Enterprise-grade accountability technology. <span className="font-semibold text-white">No excuses, no escape routes</span>, just results.
                        </p>
                    </div>

                    {/* Feature Cards - Enhanced */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Card 1: AI Vision */}
                        <div className="feature-card group">
                            <div className="feature-card-glow bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_60%)]"></div>
                            <div className="relative z-10">
                                <div className="feature-icon feature-icon-purple mb-8">
                                    <iconify-icon icon="lucide:scan-eye" width="32" className="text-purple-400"></iconify-icon>
                                </div>
                                <h3 className="text-xl font-semibold tracking-tight text-white mb-4">Multimodal Vision</h3>
                                <p className="text-base leading-[1.75] text-slate-300 mb-6">
                                    SENTINEL AI processes images and video frames in <span className="font-semibold text-white">real-time</span> to verify activity with 99% accuracy.
                                </p>
                                <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                                    <iconify-icon icon="lucide:check-circle-2" width="16"></iconify-icon>
                                    <span>Photo & Video Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Focus Detection */}
                        <div className="feature-card group">
                            <div className="feature-card-glow bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)]"></div>
                            <div className="relative z-10">
                                <div className="feature-icon feature-icon-emerald mb-8">
                                    <iconify-icon icon="lucide:brain-circuit" width="32" className="text-emerald-400"></iconify-icon>
                                </div>
                                <h3 className="text-xl font-semibold tracking-tight text-white mb-4">Focus Scoring</h3>
                                <p className="text-base leading-[1.75] text-slate-300 mb-6">
                                    AI algorithms detect distractions, phone usage, and lethargy. Get a <span className="font-semibold text-white">0-10 focus score</span> for every session.
                                </p>
                                <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                                    <iconify-icon icon="lucide:check-circle-2" width="16"></iconify-icon>
                                    <span>Distraction Detection</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Trash Filter */}
                        <div className="feature-card group">
                            <div className="feature-card-glow bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_60%)]"></div>
                            <div className="relative z-10">
                                <div className="feature-icon feature-icon-red mb-8">
                                    <iconify-icon icon="lucide:shield-alert" width="32" className="text-red-400"></iconify-icon>
                                </div>
                                <h3 className="text-xl font-semibold tracking-tight text-white mb-4">Trash Detection</h3>
                                <p className="text-base leading-[1.75] text-slate-300 mb-6">
                                    Fake submissions? Black screens? Random images? <span className="font-semibold text-white">Automatically rejected.</span> No cheating allowed.
                                </p>
                                <div className="flex items-center gap-2 text-sm font-medium text-red-300">
                                    <iconify-icon icon="lucide:x-circle" width="16"></iconify-icon>
                                    <span>Zero Tolerance Policy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Features Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Analytics Card */}
                        <div className="group relative overflow-hidden rounded-2xl border bg-[#050505] p-8 hover:border-blue-500/30 transition-all duration-500 shadow-lg border-white/10 card-hover">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <iconify-icon icon="lucide:bar-chart-3" width="28" className="text-blue-400"></iconify-icon>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium tracking-tight text-white mb-3">Advanced Analytics</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">
                                        Weekly trends, hourly patterns, activity breakdown. Know exactly when you're most productive.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Card */}
                        <div className="group relative overflow-hidden rounded-2xl border bg-[#050505] p-8 hover:border-orange-500/30 transition-all duration-500 shadow-lg border-white/10 card-hover">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <iconify-icon icon="lucide:calendar-clock" width="28" className="text-orange-400"></iconify-icon>
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium tracking-tight text-white mb-3">Smart Scheduling</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">
                                        Pre-defined activity blocks from 5 AM to 8:30 PM. Workout, study, class - every minute accounted for.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-32 bg-[#020204] overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium mb-6 text-slate-300">
                            <iconify-icon icon="lucide:workflow" width="14" className="text-purple-400"></iconify-icon>
                            WORKFLOW
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 font-serif text-white">
                            How it <span className="gradient-text-animate italic">works</span>
                        </h2>
                        <p className="text-lg leading-relaxed font-light text-slate-400 max-w-2xl mx-auto">
                            Simple. Ruthless. Effective. Three steps to accountability.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 pulse-glow">
                                <span className="text-3xl font-bold text-purple-400">1</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Select Activity</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Choose which scheduled activity you want to verify from the dropdown menu.
                            </p>
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-bold text-blue-400">2</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Upload Proof</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Take a photo or video showing you actively engaged in the activity. Upload it.
                            </p>
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl font-bold text-emerald-400">3</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Get Verified</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                SENTINEL AI instantly analyzes your proof, gives you a score, and marks the task complete.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <button
                            onClick={() => navigate('/verify')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] active:scale-95"
                        >
                            <iconify-icon icon="lucide:rocket" width="20"></iconify-icon>
                            Start Your First Verification
                            <iconify-icon icon="lucide:arrow-right" width="18"></iconify-icon>
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonial/Quote Section */}
            <section className="relative py-24 bg-[#020204] overflow-hidden border-y border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <iconify-icon icon="lucide:quote" width="48" className="text-purple-500/30 mb-6"></iconify-icon>
                    <blockquote className="text-2xl md:text-3xl font-serif italic text-white leading-relaxed mb-8">
                        "The only thing standing between you and your goals is the <span className="gradient-text-animate">bullshit story</span> you keep telling yourself."
                    </blockquote>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 overflow-hidden ring-2 ring-purple-500/30">
                            <img src="/manideep.png" alt="Manideep Pasumarthi" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-white">Manideep Pasumarthi</p>
                            <p className="text-xs text-slate-500">Sentinel AI Philosophy</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#020204] pt-20 pb-12 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                        {/* Brand */}
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="relative flex items-center justify-center w-8 h-8">
                                    <div className="absolute inset-0 bg-purple-500 blur-lg opacity-40 rounded-full"></div>
                                    <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="relative z-10 text-white" width="20" />
                                </div>
                                <span className="text-xl font-bold text-white">SENTINEL AI</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Powering tomorrow's high-performers with ruthless algorithmic accountability. Join the 1%.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:twitter" width="18" className="text-slate-400"></iconify-icon>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:github" width="18" className="text-slate-400"></iconify-icon>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:linkedin" width="18" className="text-slate-400"></iconify-icon>
                                </a>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex gap-16 text-sm">
                            <div>
                                <h4 className="font-semibold text-white mb-4">Platform</h4>
                                <ul className="space-y-3 text-slate-400">
                                    <li><button onClick={() => navigate('/verify')} className="hover:text-white transition-colors">Verify</button></li>
                                    <li><button onClick={() => navigate('/analytics')} className="hover:text-white transition-colors">Analytics</button></li>
                                    <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Company</h4>
                                <ul className="space-y-3 text-slate-400">
                                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">Legal</h4>
                                <ul className="space-y-3 text-slate-400">
                                    <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>© 2025 Sentinel AI. All rights reserved.</p>
                        <div className="flex items-center gap-2 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            SYSTEM ONLINE • v1.0.0
                        </div>
                    </div>
                </div>
            </footer>

            {/* Notification Settings Modal */}
            {showNotificationSettings && (
                <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
            )}

        </div>
    );
};
