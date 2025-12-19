import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { NotificationSettings } from '../components/NotificationSettings';

interface HomePageProps {
    logs: Record<string, { result: any }>;
    onVerificationComplete: (blockId: string, result: any) => void;
    onEditSchedule?: () => void;
}

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({
    question, answer, isOpen, onToggle
}) => (
    <div className="border-b border-white/10 last:border-0">
        <button
            onClick={onToggle}
            className="w-full py-5 flex items-center justify-between text-left hover:bg-white/5 px-4 -mx-4 rounded-lg transition-colors"
        >
            <span className="font-medium text-white pr-4">{question}</span>
            <iconify-icon
                icon={isOpen ? "lucide:minus" : "lucide:plus"}
                width="20"
                className={`text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            ></iconify-icon>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
            <p className="text-slate-400 leading-relaxed">{answer}</p>
        </div>
    </div>
);

// Testimonial Card
const TestimonialCard: React.FC<{ name: string; role: string; quote: string; avatar: string; rating: number }> = ({
    name, role, quote, avatar, rating
}) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
                <iconify-icon
                    key={i}
                    icon="lucide:star"
                    width="16"
                    className={i < rating ? "text-yellow-400" : "text-slate-600"}
                ></iconify-icon>
            ))}
        </div>
        <p className="text-slate-300 mb-6 leading-relaxed italic">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {avatar}
            </div>
            <div>
                <p className="font-medium text-white text-sm">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
            </div>
        </div>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ logs, onEditSchedule }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { schedule } = useSchedule();
    const [isLoaded, setIsLoaded] = useState(false);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        const handleMouseMove = (e: MouseEvent) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileMenuOpen(false);
    };

    // Stats
    const totalTasks = schedule.length;
    const completedTasks = Object.values(logs).filter((l: any) => l.result?.task_verified).length;
    const totalFocusPoints: number = Object.values(logs).reduce<number>((acc, l: any) => acc + (l.result?.focus_score || 0), 0);

    const faqs = [
        {
            question: "How does SENTINEL AI verify my tasks?",
            answer: "Simply upload a photo or video proof of your completed activity. Our AI powered by Google Gemini analyzes the content, verifies task completion, and provides a focus score (1-10) with constructive feedback."
        },
        {
            question: "Is my data private and secure?",
            answer: "Absolutely. All uploaded files are stored securely on Supabase. Your verification data is only accessible to you, and we never share your information with third parties. We're committed to your privacy."
        },
        {
            question: "Can I customize my daily schedule?",
            answer: "Yes! You have full control over your timetable. Add, edit, or remove activities to match your unique routine. Whether you're a student, professional, or fitness enthusiast, SENTINEL adapts to you."
        },
        {
            question: "What types of activities can I verify?",
            answer: "Any activity that can be captured in a photo or video: workouts, study sessions, work tasks, meditation, reading, coding, creative projects, and more. If you can prove it, we can verify it."
        },
        {
            question: "Is there a mobile app?",
            answer: "SENTINEL AI is a progressive web app (PWA) that works beautifully on mobile browsers. You can add it to your home screen for an app-like experience. Native iOS/Android apps are coming soon!"
        },
        {
            question: "Is it free to use?",
            answer: "Yes! SENTINEL AI is completely free during our beta period. We're building the most powerful accountability tool, and your feedback helps us improve. Premium features will be introduced later."
        }
    ];

    const testimonials = [
        { name: "Alex Chen", role: "Software Engineer", quote: "Finally, an accountability system that doesn't rely on willpower. The AI verification is surprisingly accurate!", avatar: "A", rating: 5 },
        { name: "Sarah Miller", role: "Fitness Coach", quote: "My clients love it. Being able to verify their workout photos keeps them honest and motivated.", avatar: "S", rating: 5 },
        { name: "James Wilson", role: "University Student", quote: "Game changer for my study habits. The focus scores help me understand when I'm truly locked in.", avatar: "J", rating: 5 },
    ];

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
                <div className="ambient-orb ambient-orb-1"></div>
                <div className="ambient-orb ambient-orb-2"></div>
            </div>

            {/* ========================================== */}
            {/* 1. NAVBAR with CTA */}
            {/* ========================================== */}
            <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center w-8 h-8">
                            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-40 rounded-full"></div>
                            <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="relative z-10" width="24" />
                        </div>
                        <span className="text-lg font-bold text-white">SENTINEL AI</span>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-sm text-slate-400 hover:text-white transition-colors">Features</button>
                        <button onClick={() => scrollToSection('benefits')} className="text-sm text-slate-400 hover:text-white transition-colors">Benefits</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</button>
                        <button onClick={() => scrollToSection('testimonials')} className="text-sm text-slate-400 hover:text-white transition-colors">Reviews</button>
                        <button onClick={() => scrollToSection('faq')} className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</button>
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <button onClick={() => navigate('/verify')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all">
                                    <iconify-icon icon="lucide:camera" width="16"></iconify-icon>
                                    Verify Now
                                </button>
                                <button onClick={() => signOut()} className="text-sm text-slate-400 hover:text-white">Sign Out</button>
                            </>
                        ) : (
                            <button onClick={() => navigate('/signin')} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all">
                                Get Started Free
                                <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-400 hover:text-white">
                            <iconify-icon icon={mobileMenuOpen ? "lucide:x" : "lucide:menu"} width="24"></iconify-icon>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#0a0a0c] border-t border-white/5 px-6 py-4 space-y-3">
                        <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-slate-400 hover:text-white">Features</button>
                        <button onClick={() => scrollToSection('benefits')} className="block w-full text-left py-2 text-slate-400 hover:text-white">Benefits</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 text-slate-400 hover:text-white">How It Works</button>
                        <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left py-2 text-slate-400 hover:text-white">Reviews</button>
                        <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-slate-400 hover:text-white">FAQ</button>
                    </div>
                )}
            </nav>

            {/* ========================================== */}
            {/* 2. HERO SECTION */}
            {/* ========================================== */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-24 px-6 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center z-10">
                    {/* Pre-headline badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border bg-white/5 border-white/10 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">AI-Powered Accountability</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        Stop Lying to Yourself.<br />
                        <span className="gradient-text-animate">Start Proving It.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        Upload proof of your completed tasks. Get instant AI verification.
                        Build unstoppable momentum with <span className="text-white font-medium">real accountability</span>.
                    </p>

                    {/* Unique Selling Points */}
                    <div className={`flex flex-wrap justify-center gap-4 mb-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <iconify-icon icon="lucide:check-circle" width="16" className="text-emerald-400"></iconify-icon>
                            No more excuses
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <iconify-icon icon="lucide:check-circle" width="16" className="text-emerald-400"></iconify-icon>
                            Instant AI verification
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <iconify-icon icon="lucide:check-circle" width="16" className="text-emerald-400"></iconify-icon>
                            100% free to use
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <button
                            onClick={() => user ? navigate('/verify') : navigate('/signin')}
                            className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
                        >
                            <iconify-icon icon="lucide:rocket" width="20"></iconify-icon>
                            Start Free Now
                            <iconify-icon icon="lucide:arrow-right" width="18"></iconify-icon>
                        </button>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="btn-secondary px-6 py-3 w-full sm:w-auto"
                        >
                            <iconify-icon icon="lucide:play-circle" width="20"></iconify-icon>
                            See How It Works
                        </button>
                    </div>

                    {/* Video/Demo Preview */}
                    <div className={`relative max-w-3xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="relative rounded-2xl border bg-[#0a0a0c] overflow-hidden shadow-2xl border-white/10">
                            <div className="scanline"></div>

                            {/* Browser Chrome */}
                            <div className="h-10 border-b bg-white/[0.02] flex items-center px-4 justify-between border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    AI: ACTIVE
                                </div>
                            </div>

                            {/* Demo Content */}
                            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-slate-900/50 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                                        <iconify-icon icon="lucide:play" width="36" className="text-purple-400 ml-1"></iconify-icon>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Watch SENTINEL AI in Action</h3>
                                    <p className="text-sm text-slate-400">See how AI verifies your task completion in seconds</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizon Ring Effect */}
                <div className="absolute w-[200vw] h-[200vw] rounded-full border border-white/5 left-1/2 bottom-[-180vw] -translate-x-1/2 shadow-[0_-60px_150px_-30px_rgba(168,85,247,0.25)] pointer-events-none z-0"></div>
            </section>

            {/* ========================================== */}
            {/* 3. SOCIAL PROOF */}
            {/* ========================================== */}
            <section className="relative py-12 bg-[#020204] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">10,000+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Tasks Verified</div>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Active Users</div>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">User Rating</div>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">99%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Accuracy</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 4. BENEFITS SECTION */}
            {/* ========================================== */}
            <section id="benefits" className="relative py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-medium">Why SENTINEL AI?</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
                            Benefits That <span className="gradient-text-animate">Actually Matter</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Stop relying on motivation. Start building a system that forces you to show up.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="group p-8 rounded-2xl border bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-purple-500/30 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <iconify-icon icon="lucide:brain" width="28" className="text-purple-400"></iconify-icon>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Kill Self-Deception</h3>
                            <p className="text-slate-400 leading-relaxed">
                                No more "I'll do it later" or "That counted." Our AI sees through excuses and demands real proof of your work.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="group p-8 rounded-2xl border bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-emerald-500/30 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <iconify-icon icon="lucide:trending-up" width="28" className="text-emerald-400"></iconify-icon>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Build Momentum</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Track streaks, earn achievements, and watch your consistency compound. Small wins lead to massive transformations.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="group p-8 rounded-2xl border bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-blue-500/30 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <iconify-icon icon="lucide:eye" width="28" className="text-blue-400"></iconify-icon>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">See Your Progress</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Beautiful analytics show exactly where you're winning and where you're slipping. Data doesn't lie.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 5. FEATURES SECTION */}
            {/* ========================================== */}
            <section id="features" className="relative py-24 bg-[#020204]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-medium">Features</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
                            Everything You Need to <span className="gradient-text-animate">Dominate</span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: "lucide:camera", title: "Photo/Video Proof", desc: "Upload any media as verification" },
                            { icon: "lucide:brain", title: "AI Analysis", desc: "Instant verification with Gemini AI" },
                            { icon: "lucide:calendar", title: "Custom Schedule", desc: "Design your perfect routine" },
                            { icon: "lucide:bar-chart-3", title: "Analytics", desc: "Track performance over time" },
                            { icon: "lucide:flame", title: "Streak Tracking", desc: "Build unstoppable consistency" },
                            { icon: "lucide:trophy", title: "Achievements", desc: "Unlock badges as you progress" },
                            { icon: "lucide:bell", title: "Smart Reminders", desc: "Never miss a scheduled task" },
                            { icon: "lucide:shield-check", title: "Privacy First", desc: "Your data, your control" },
                        ].map((feature, i) => (
                            <div key={i} className="p-6 rounded-xl border bg-white/5 border-white/10 hover:border-purple-500/30 transition-all group">
                                <iconify-icon icon={feature.icon} width="24" className="text-purple-400 mb-4 group-hover:scale-110 transition-transform inline-block"></iconify-icon>
                                <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                                <p className="text-sm text-slate-500">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 6. HOW IT WORKS */}
            {/* ========================================== */}
            <section id="how-it-works" className="relative py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-medium">Simple Process</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
                            How SENTINEL AI <span className="gradient-text-animate">Works</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-emerald-500/50"></div>

                        {/* Step 1 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 bg-[#0a0a0c]">
                                <span className="text-3xl font-bold text-purple-400">1</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Set Your Schedule</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Create your personalized timetable with activities you want to stay accountable for.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 bg-[#0a0a0c]">
                                <span className="text-3xl font-bold text-cyan-400">2</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Upload Your Proof</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Complete your task, snap a photo or record a video, and upload it as evidence.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10 bg-[#0a0a0c]">
                                <span className="text-3xl font-bold text-emerald-400">3</span>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-3">Get Verified</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                AI analyzes your proof instantly, gives you a focus score, and marks the task complete.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <button
                            onClick={() => user ? navigate('/verify') : navigate('/signin')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] active:scale-95"
                        >
                            <iconify-icon icon="lucide:rocket" width="20"></iconify-icon>
                            Start Your First Verification
                            <iconify-icon icon="lucide:arrow-right" width="18"></iconify-icon>
                        </button>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 7. TESTIMONIALS */}
            {/* ========================================== */}
            <section id="testimonials" className="relative py-24 bg-[#020204] border-y border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-medium">Testimonials</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
                            What Our Users <span className="gradient-text-animate">Say</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} {...t} />
                        ))}
                    </div>

                    {/* Quote */}
                    <div className="mt-16 text-center max-w-3xl mx-auto">
                        <iconify-icon icon="lucide:quote" width="40" className="text-purple-500/30 mb-4"></iconify-icon>
                        <blockquote className="text-2xl md:text-3xl font-serif italic text-white leading-relaxed mb-6">
                            "The only thing standing between you and your goals is the <span className="gradient-text-animate">bullshit story</span> you keep telling yourself."
                        </blockquote>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 overflow-hidden ring-2 ring-purple-500/30">
                                <img src="/manideep.png" alt="Manideep Pasumarthi" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-white">Manideep Pasumarthi</p>
                                <p className="text-xs text-slate-500">Founder, SENTINEL AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 8. FAQ SECTION */}
            {/* ========================================== */}
            <section id="faq" className="relative py-24">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-medium">FAQ</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">
                            Frequently Asked <span className="gradient-text-animate">Questions</span>
                        </h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        {faqs.map((faq, i) => (
                            <FAQItem
                                key={i}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFAQ === i}
                                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================== */}
            {/* 9. FINAL CTA */}
            {/* ========================================== */}
            <section className="relative py-24 bg-gradient-to-b from-[#020204] to-[#0a0a0c]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to Stop Making <span className="gradient-text-animate">Excuses?</span>
                    </h2>
                    <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of high-performers who use SENTINEL AI to stay accountable and crush their goals every single day.
                    </p>
                    <button
                        onClick={() => user ? navigate('/verify') : navigate('/signin')}
                        className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-xl transition-all shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.7)] hover:scale-105 active:scale-95"
                    >
                        <iconify-icon icon="lucide:rocket" width="24"></iconify-icon>
                        Start Free Today
                        <iconify-icon icon="lucide:arrow-right" width="20"></iconify-icon>
                    </button>
                    <p className="text-sm text-slate-500 mt-4">No credit card required • Free forever during beta</p>
                </div>
            </section>

            {/* ========================================== */}
            {/* 10. FOOTER */}
            {/* ========================================== */}
            <footer className="border-t border-white/5 bg-[#020204] pt-16 pb-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="relative flex items-center justify-center w-8 h-8">
                                    <div className="absolute inset-0 bg-purple-500 blur-lg opacity-40 rounded-full"></div>
                                    <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="relative z-10" width="20" />
                                </div>
                                <span className="text-lg font-bold text-white">SENTINEL AI</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                AI-powered accountability for high-performers who refuse to settle.
                            </p>
                            <div className="flex items-center gap-3">
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:twitter" width="16" className="text-slate-400"></iconify-icon>
                                </a>
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:github" width="16" className="text-slate-400"></iconify-icon>
                                </a>
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:linkedin" width="16" className="text-slate-400"></iconify-icon>
                                </a>
                                <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <iconify-icon icon="lucide:instagram" width="16" className="text-slate-400"></iconify-icon>
                                </a>
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><button onClick={() => navigate('/verify')} className="hover:text-white transition-colors">Verify Task</button></li>
                                <li><button onClick={() => navigate('/analytics')} className="hover:text-white transition-colors">Analytics</button></li>
                                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="mailto:support@sentinelai.com" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>© 2025 SENTINEL AI. All rights reserved.</p>
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
