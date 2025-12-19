import React, { useState, useEffect } from 'react';
import { ScheduleBlock, ActivityType } from '../types';
import { parseTimetableText, validateSchedule, saveUserSchedule, DEFAULT_SCHEDULE } from '../services/scheduleService';

interface ScheduleEditorProps {
    userId: string;
    currentSchedule: ScheduleBlock[];
    onSave: (schedule: ScheduleBlock[]) => void;
    onClose: () => void;
    isFirstTime?: boolean;
}

const ACTIVITY_TYPES = [
    { value: ActivityType.WORKOUT, label: '🏋️ Workout', color: 'emerald' },
    { value: ActivityType.CLASS, label: '📚 Class', color: 'blue' },
    { value: ActivityType.DEEP_STUDY, label: '🧠 Deep Study', color: 'purple' },
    { value: ActivityType.STUDY, label: '📖 Study', color: 'amber' },
    { value: ActivityType.WALK, label: '🚶 Walk/Break', color: 'pink' },
];

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
    userId,
    currentSchedule,
    onSave,
    onClose,
    isFirstTime = false
}) => {
    const [schedule, setSchedule] = useState<ScheduleBlock[]>(currentSchedule.length > 0 ? currentSchedule : DEFAULT_SCHEDULE);
    const [pasteMode, setPasteMode] = useState(false);
    const [pasteText, setPasteText] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const addActivity = () => {
        const newId = `custom-${Date.now()}`;
        const lastBlock = schedule[schedule.length - 1];
        const newStart = lastBlock ? lastBlock.end : '09:00';

        // Calculate end time (1 hour after start)
        const [h, m] = newStart.split(':').map(Number);
        const endH = Math.min(h + 1, 23);
        const newEnd = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        setSchedule([...schedule, {
            id: newId,
            start: newStart,
            end: newEnd,
            activity: 'New Activity',
            type: ActivityType.STUDY
        }]);
    };

    const removeActivity = (id: string) => {
        setSchedule(schedule.filter(block => block.id !== id));
    };

    const updateActivity = (id: string, field: keyof ScheduleBlock, value: string) => {
        setSchedule(schedule.map(block =>
            block.id === id ? { ...block, [field]: value } : block
        ));
    };

    const handlePasteSubmit = () => {
        const parsed = parseTimetableText(pasteText);
        if (parsed.length > 0) {
            setSchedule(parsed);
            setPasteMode(false);
            setPasteText('');
            setErrors([]);
        } else {
            setErrors(['Could not parse timetable. Please use format: "HH:MM - HH:MM Activity Name"']);
        }
    };

    const handleSave = async () => {
        const validation = validateSchedule(schedule);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setIsSaving(true);
        setErrors([]);

        // Sort by start time before saving
        const sortedSchedule = [...schedule].sort((a, b) => a.start.localeCompare(b.start));

        const success = await saveUserSchedule(userId, sortedSchedule);

        if (success) {
            onSave(sortedSchedule);
        } else {
            setErrors(['Failed to save schedule. Please try again.']);
        }

        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0a0a0c] border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <iconify-icon icon="lucide:calendar-days" width="24" className="text-purple-400"></iconify-icon>
                                {isFirstTime ? 'Set Up Your Schedule' : 'Edit Your Schedule'}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                {isFirstTime
                                    ? 'Create your daily routine to start tracking'
                                    : 'Customize your daily activities'
                                }
                            </p>
                        </div>
                        {!isFirstTime && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <iconify-icon icon="lucide:x" width="20" className="text-slate-400"></iconify-icon>
                            </button>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setPasteMode(false)}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${!pasteMode
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <iconify-icon icon="lucide:edit-3" width="14" className="mr-2"></iconify-icon>
                            Manual Entry
                        </button>
                        <button
                            onClick={() => setPasteMode(true)}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${pasteMode
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <iconify-icon icon="lucide:clipboard-paste" width="14" className="mr-2"></iconify-icon>
                            Paste Timetable
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {pasteMode ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-2 block">
                                    Paste your timetable (one activity per line)
                                </label>
                                <textarea
                                    value={pasteText}
                                    onChange={(e) => setPasteText(e.target.value)}
                                    placeholder={`Example format:\n06:00 - 07:00 Morning Workout\n09:00 - 12:00 Deep Study Session\n14:00 - 17:00 Work\n18:00 - 19:00 Evening Walk`}
                                    className="w-full h-48 px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono resize-none focus:border-purple-500/50 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handlePasteSubmit}
                                disabled={!pasteText.trim()}
                                className="w-full py-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <iconify-icon icon="lucide:wand-2" width="16" className="mr-2"></iconify-icon>
                                Parse Timetable
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedule.map((block, index) => (
                                <div
                                    key={block.id}
                                    className="p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-xs text-slate-500 font-mono w-6">{index + 1}.</span>
                                        <div className="flex-1 flex items-center gap-2">
                                            {/* Start Time */}
                                            <input
                                                type="time"
                                                value={block.start}
                                                onChange={(e) => updateActivity(block.id, 'start', e.target.value)}
                                                className="px-2 py-1.5 bg-black/60 border border-white/10 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                            />
                                            <span className="text-slate-500">-</span>
                                            {/* End Time */}
                                            <input
                                                type="time"
                                                value={block.end}
                                                onChange={(e) => updateActivity(block.id, 'end', e.target.value)}
                                                className="px-2 py-1.5 bg-black/60 border border-white/10 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeActivity(block.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                                        </button>
                                    </div>

                                    <div className="flex gap-3 ml-9">
                                        {/* Activity Name */}
                                        <input
                                            type="text"
                                            value={block.activity}
                                            onChange={(e) => updateActivity(block.id, 'activity', e.target.value)}
                                            placeholder="Activity name"
                                            className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                        />

                                        {/* Activity Type */}
                                        <select
                                            value={block.type}
                                            onChange={(e) => updateActivity(block.id, 'type', e.target.value)}
                                            className="px-3 py-2 bg-black/60 border border-white/10 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                        >
                                            {ACTIVITY_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}

                            {/* Add Activity Button */}
                            <button
                                onClick={addActivity}
                                className="w-full py-3 border border-dashed border-white/20 rounded-lg text-slate-400 hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-500/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <iconify-icon icon="lucide:plus" width="16"></iconify-icon>
                                Add Activity
                            </button>
                        </div>
                    )}

                    {/* Errors */}
                    {errors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm font-medium text-red-400 mb-2">Please fix the following:</p>
                            <ul className="text-xs text-red-300 space-y-1">
                                {errors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    {!isFirstTime && (
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-lg font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || schedule.length === 0}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <iconify-icon icon="lucide:loader-2" width="16" className="animate-spin"></iconify-icon>
                                Saving...
                            </>
                        ) : (
                            <>
                                <iconify-icon icon="lucide:check" width="16"></iconify-icon>
                                {isFirstTime ? 'Start Tracking' : 'Save Schedule'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
