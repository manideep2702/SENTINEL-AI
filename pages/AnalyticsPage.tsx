import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { fetchVerificationsByDate, VerificationRecord } from '../services/verificationService';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface AnalyticsPageProps {
    logs: Record<string, { result: any }>;
}

// Mock data for comprehensive analytics
const weeklyData = [
    { day: 'Mon', focus: 7.5, tasks: 4, hours: 8.5 },
    { day: 'Tue', focus: 8.2, tasks: 5, hours: 9.0 },
    { day: 'Wed', focus: 6.8, tasks: 3, hours: 7.5 },
    { day: 'Thu', focus: 9.1, tasks: 6, hours: 10.0 },
    { day: 'Fri', focus: 7.8, tasks: 5, hours: 8.0 },
    { day: 'Sat', focus: 8.5, tasks: 4, hours: 9.5 },
    { day: 'Sun', focus: 7.2, tasks: 3, hours: 7.0 },
];

const activityBreakdown = [
    { name: 'Deep Study', value: 35, color: '#a855f7' },
    { name: 'Workout', value: 20, color: '#10b981' },
    { name: 'Class', value: 25, color: '#3b82f6' },
    { name: 'Study', value: 15, color: '#f59e0b' },
    { name: 'Walk', value: 5, color: '#ec4899' },
];

const hourlyFocus = [
    { hour: '5AM', score: 8.5 },
    { hour: '8AM', score: 7.2 },
    { hour: '11AM', score: 9.0 },
    { hour: '3PM', score: 7.8 },
    { hour: '6PM', score: 6.5 },
    { hour: '8PM', score: 8.2 },
];

const performanceRadar = [
    { metric: 'Focus', value: 85 },
    { metric: 'Consistency', value: 78 },
    { metric: 'Productivity', value: 92 },
    { metric: 'Discipline', value: 88 },
    { metric: 'Energy', value: 75 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0a0a0c] border border-white/20 p-3 rounded-lg shadow-xl">
                <p className="text-xs text-slate-400 font-mono mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Calendar Component
const Calendar: React.FC<{
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}> = ({ selectedDate, onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty slots for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return date.toDateString() === selectedDate.toDateString();
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    return (
        <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <iconify-icon icon="lucide:chevron-left" width="16" className="text-slate-400"></iconify-icon>
                </button>
                <h3 className="text-sm font-medium text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <iconify-icon icon="lucide:chevron-right" width="16" className="text-slate-400"></iconify-icon>
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div key={day} className="text-center text-xs text-slate-500 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => (
                    <button
                        key={index}
                        onClick={() => date && onDateSelect(date)}
                        disabled={!date}
                        className={`
                            aspect-square flex items-center justify-center text-xs rounded-lg transition-all
                            ${!date ? 'invisible' : ''}
                            ${date && isSelected(date)
                                ? 'bg-purple-500 text-white font-semibold'
                                : date && isToday(date)
                                    ? 'bg-purple-500/20 text-purple-400 font-medium'
                                    : 'text-slate-400 hover:bg-white/5'
                            }
                        `}
                    >
                        {date?.getDate()}
                    </button>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                    onClick={() => onDateSelect(new Date())}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                >
                    Today
                </button>
                <button
                    onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        onDateSelect(yesterday);
                    }}
                    className="flex-1 text-xs py-2 px-3 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                >
                    Yesterday
                </button>
            </div>
        </div>
    );
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ logs }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { schedule } = useSchedule();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateVerifications, setDateVerifications] = useState<VerificationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check if selected date is today
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    // Fetch verifications when date changes
    useEffect(() => {
        const loadVerifications = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                const verifications = await fetchVerificationsByDate(user.id, selectedDate);
                setDateVerifications(verifications);
                console.log(`📅 Loaded ${verifications.length} verifications for ${selectedDate.toDateString()}`);
            } catch (error) {
                console.error('Error loading verifications:', error);
                setDateVerifications([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadVerifications();
    }, [selectedDate, user]);

    // Calculate stats from date verifications or today's logs
    const stats = useMemo(() => {
        // Use today's logs if viewing today, otherwise use fetched verifications
        if (isToday) {
            const entries = Object.values(logs) as Array<{ result: any }>;
            const totalTasks = entries.length;
            const completedTasks = entries.filter(e => e.result?.task_verified).length;
            const totalFocus = entries.reduce((acc, curr) => acc + (curr.result?.focus_score || 0), 0);
            const avgFocus = totalTasks > 0 ? (totalFocus / totalTasks).toFixed(1) : '0.0';
            const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return { totalTasks, completedTasks, avgFocus, successRate, totalFocus };
        } else {
            const totalTasks = dateVerifications.length;
            const completedTasks = dateVerifications.filter(v => v.task_verified).length;
            const totalFocus = dateVerifications.reduce((acc, v) => acc + (v.focus_score || 0), 0);
            const avgFocus = totalTasks > 0 ? (totalFocus / totalTasks).toFixed(1) : '0.0';
            const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return { totalTasks, completedTasks, avgFocus, successRate, totalFocus };
        }
    }, [logs, dateVerifications, isToday]);

    // Generate activity breakdown from user's actual schedule
    const dynamicActivityBreakdown = useMemo(() => {
        const activityColors: Record<string, string> = {
            'Workout': '#10b981', 'Gym': '#10b981', 'Yoga': '#14b8a6', 'Walk': '#ec4899',
            'Running': '#f97316', 'Sports': '#22c55e', 'Class': '#3b82f6', 'Lecture': '#6366f1',
            'Study': '#f59e0b', 'Deep Study': '#a855f7', 'Reading': '#8b5cf6', 'Work': '#0ea5e9',
            'Meeting': '#06b6d4', 'Coding': '#84cc16', 'Morning Routine': '#fbbf24',
            'Breakfast': '#fb923c', 'Lunch': '#f97316', 'Dinner': '#ef4444', 'Break': '#94a3b8',
            'Meditation': '#8b5cf6', 'Commute': '#64748b', 'Other': '#a855f7'
        };

        // Count activities by type
        const typeCounts: Record<string, number> = {};
        schedule.forEach(block => {
            const type = block.type || 'Other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        return Object.entries(typeCounts).map(([name, value]) => ({
            name,
            value,
            color: activityColors[name] || '#a855f7'
        }));
    }, [schedule]);

    // Generate task-based data for today
    const taskFocusData = useMemo(() => {
        return schedule.map(block => {
            const log = logs[block.id];
            return {
                name: block.activity?.substring(0, 10) || 'Task',
                score: log?.result?.focus_score || 0,
                time: block.start
            };
        });
    }, [schedule, logs]);

    return (
        <div className="min-h-screen bg-[#020204] text-slate-400">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 border-b bg-[#020204]/70 backdrop-blur-xl border-white/5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="relative flex items-center justify-center w-6 h-6 transition-transform group-active:scale-95">
                            <div className="absolute inset-0 bg-purple-500 blur opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
                            <img src="/Sentinellogo.jpg" alt="Sentinel AI" className="relative z-10 text-white" width="18" />
                        </div>
                        <span className="text-sm tracking-tight font-semibold text-white">SENTINEL AI</span>
                    </button>
                    <div className="h-4 w-px bg-white/10"></div>
                    <h1 className="text-sm font-medium text-slate-300">Analytics Dashboard</h1>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-xs font-medium bg-[#0a0a0c] border px-4 py-2 rounded-md transition-all hover:border-purple-500/50 text-white border-white/10 active:scale-95"
                >
                    <iconify-icon icon="lucide:arrow-left" width="14"></iconify-icon>
                    Back to Home
                </button>
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">

                {/* Date Selector & Stats Overview */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-3xl font-medium tracking-tight mb-2 font-serif text-white">
                                Performance Overview
                            </h2>
                            <p className="text-slate-400">Comprehensive analysis of your accountability journey</p>
                        </div>

                        {/* Date Picker Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0a0a0c] border border-white/10 hover:border-purple-500/50 transition-all group"
                            >
                                <iconify-icon icon="lucide:calendar" width="18" className="text-purple-400"></iconify-icon>
                                <div className="text-left">
                                    <p className="text-xs text-slate-500">Viewing</p>
                                    <p className="text-sm font-medium text-white">{formattedDate}</p>
                                </div>
                                <iconify-icon
                                    icon={showCalendar ? "lucide:chevron-up" : "lucide:chevron-down"}
                                    width="16"
                                    className="text-slate-400 ml-2"
                                ></iconify-icon>
                            </button>

                            {/* Calendar Dropdown */}
                            {showCalendar && (
                                <div className="absolute right-0 top-full mt-2 z-50 shadow-xl">
                                    <Calendar
                                        selectedDate={selectedDate}
                                        onDateSelect={(date) => {
                                            setSelectedDate(date);
                                            setShowCalendar(false);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Loading or Date Context */}
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                            <iconify-icon icon="lucide:loader-2" width="16" className="animate-spin"></iconify-icon>
                            Loading data for {formattedDate}...
                        </div>
                    ) : !isToday && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 w-fit">
                            <iconify-icon icon="lucide:history" width="14" className="text-purple-400"></iconify-icon>
                            <span className="text-xs text-purple-300">Viewing historical data</span>
                        </div>
                    )}
                </div>

                {/* Key Metrics Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 ${isLoading ? 'opacity-50' : ''}`}>
                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-purple-500/20 transition-colors group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <iconify-icon icon="lucide:target" width="20" className="text-purple-400"></iconify-icon>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Total Tasks</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.totalTasks}</div>
                        <p className="text-xs text-slate-500 mt-2">Logged activities</p>
                    </div>

                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-green-500/20 transition-colors group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                <iconify-icon icon="lucide:check-circle" width="20" className="text-green-400"></iconify-icon>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Completed</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.completedTasks}</div>
                        <p className="text-xs text-slate-500 mt-2">{stats.successRate}% success rate</p>
                    </div>

                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-blue-500/20 transition-colors group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <iconify-icon icon="lucide:zap" width="20" className="text-blue-400"></iconify-icon>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Avg Focus</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.avgFocus}/10</div>
                        <p className="text-xs text-slate-500 mt-2">Focus score</p>
                    </div>

                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-orange-500/20 transition-colors group">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <iconify-icon icon="lucide:flame" width="20" className="text-orange-400"></iconify-icon>
                            </div>
                            <span className="text-xs text-slate-500 uppercase tracking-wide">Total Points</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.totalFocus}</div>
                        <p className="text-xs text-slate-500 mt-2">Focus points earned</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* Weekly Focus Trend */}
                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-purple-500/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Weekly Focus Trend</h3>
                                <p className="text-xs text-slate-500">Daily focus score progression</p>
                            </div>
                            <iconify-icon icon="lucide:trending-up" width="20" className="text-purple-400"></iconify-icon>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData}>
                                    <defs>
                                        <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 10]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="focus" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Breakdown */}
                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-purple-500/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Activity Breakdown</h3>
                                <p className="text-xs text-slate-500">Time distribution by activity type</p>
                            </div>
                            <iconify-icon icon="lucide:pie-chart" width="20" className="text-purple-400"></iconify-icon>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dynamicActivityBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {dynamicActivityBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Task Focus Scores */}
                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-purple-500/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Task Focus Scores</h3>
                                <p className="text-xs text-slate-500">Focus score per activity</p>
                            </div>
                            <iconify-icon icon="lucide:bar-chart-3" width="20" className="text-purple-400"></iconify-icon>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskFocusData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="score" fill="#a855f7" radius={[0, 4, 4, 0]} background={{ fill: '#ffffff08' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Performance Radar */}
                    <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-purple-500/20 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Performance Metrics</h3>
                                <p className="text-xs text-slate-500">Multi-dimensional analysis</p>
                            </div>
                            <iconify-icon icon="lucide:radar" width="20" className="text-purple-400"></iconify-icon>
                        </div>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={performanceRadar}>
                                    <PolarGrid stroke="#ffffff20" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Radar name="Performance" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Weekly Tasks Overview */}
                <div className="rounded-lg border bg-[#0a0a0c] border-white/5 p-6 hover:border-purple-500/20 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-1">Weekly Tasks & Hours</h3>
                            <p className="text-xs text-slate-500">Task completion and time investment</p>
                        </div>
                        <iconify-icon icon="lucide:bar-chart-3" width="20" className="text-purple-400"></iconify-icon>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 p-6">
                        <iconify-icon icon="lucide:lightbulb" width="24" className="text-purple-400 mb-3"></iconify-icon>
                        <h4 className="text-sm font-medium text-white mb-2">Peak Performance</h4>
                        <p className="text-xs text-slate-400">Your best focus hours are between 11AM - 3PM. Schedule deep work during this window.</p>
                    </div>

                    <div className="rounded-lg border bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 p-6">
                        <iconify-icon icon="lucide:trophy" width="24" className="text-green-400 mb-3"></iconify-icon>
                        <h4 className="text-sm font-medium text-white mb-2">Consistency Streak</h4>
                        <p className="text-xs text-slate-400">You've maintained {stats.successRate}% task completion. Keep pushing for 90%+!</p>
                    </div>

                    <div className="rounded-lg border bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 p-6">
                        <iconify-icon icon="lucide:alert-circle" width="24" className="text-orange-400 mb-3"></iconify-icon>
                        <h4 className="text-sm font-medium text-white mb-2">Improvement Area</h4>
                        <p className="text-xs text-slate-400">Evening sessions show lower focus. Consider earlier study blocks or energy management.</p>
                    </div>
                </div>

            </main>
        </div>
    );
};
