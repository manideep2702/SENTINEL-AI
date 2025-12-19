import React, { useState, useRef } from 'react';
import { ScheduleBlock, ActivityType } from '../types';
import { parseTimetableText, validateSchedule, saveUserSchedule, DEFAULT_SCHEDULE, parseScheduleFile } from '../services/scheduleService';

interface ScheduleEditorProps {
    userId: string;
    currentSchedule: ScheduleBlock[];
    onSave: (schedule: ScheduleBlock[]) => void;
    onClose: () => void;
    isFirstTime?: boolean;
}

// Organized activity types with icons
const ACTIVITY_TYPES = [
    // Fitness & Health
    { value: ActivityType.WORKOUT, label: '🏋️ Workout' },
    { value: ActivityType.GYM, label: '💪 Gym' },
    { value: ActivityType.YOGA, label: '🧘 Yoga' },
    { value: ActivityType.WALK, label: '🚶 Walk' },
    { value: ActivityType.RUNNING, label: '🏃 Running' },
    { value: ActivityType.SPORTS, label: '⚽ Sports' },

    // Learning & Education
    { value: ActivityType.CLASS, label: '📚 Class' },
    { value: ActivityType.LECTURE, label: '🎓 Lecture' },
    { value: ActivityType.STUDY, label: '📖 Study' },
    { value: ActivityType.DEEP_STUDY, label: '🧠 Deep Study' },
    { value: ActivityType.READING, label: '📕 Reading' },
    { value: ActivityType.HOMEWORK, label: '✏️ Homework' },
    { value: ActivityType.EXAM_PREP, label: '📝 Exam Prep' },
    { value: ActivityType.ONLINE_COURSE, label: '💻 Online Course' },

    // Work & Productivity
    { value: ActivityType.WORK, label: '💼 Work' },
    { value: ActivityType.MEETING, label: '👥 Meeting' },
    { value: ActivityType.CODING, label: '👨‍💻 Coding' },
    { value: ActivityType.WRITING, label: '✍️ Writing' },
    { value: ActivityType.PROJECT, label: '📋 Project' },
    { value: ActivityType.RESEARCH, label: '🔬 Research' },
    { value: ActivityType.OFFICE, label: '🏢 Office' },

    // Personal & Daily
    { value: ActivityType.MORNING_ROUTINE, label: '🌅 Morning Routine' },
    { value: ActivityType.BREAKFAST, label: '🍳 Breakfast' },
    { value: ActivityType.LUNCH, label: '🍽️ Lunch' },
    { value: ActivityType.DINNER, label: '🍲 Dinner' },
    { value: ActivityType.BREAK, label: '☕ Break' },
    { value: ActivityType.NAP, label: '😴 Nap' },
    { value: ActivityType.MEDITATION, label: '🧘‍♂️ Meditation' },
    { value: ActivityType.COMMUTE, label: '🚗 Commute' },

    // Creative & Hobbies
    { value: ActivityType.MUSIC, label: '🎵 Music' },
    { value: ActivityType.ART, label: '🎨 Art' },
    { value: ActivityType.GAMING, label: '🎮 Gaming' },
    { value: ActivityType.SIDE_PROJECT, label: '🚀 Side Project' },

    // Social & Family
    { value: ActivityType.FAMILY_TIME, label: '👨‍👩‍👧 Family Time' },
    { value: ActivityType.SOCIAL, label: '🤝 Social' },
    { value: ActivityType.PHONE_CALLS, label: '📞 Phone Calls' },

    // Other
    { value: ActivityType.OTHER, label: '📌 Other' },
    { value: ActivityType.CUSTOM, label: '✨ Custom' },
];

type InputMode = 'manual' | 'paste' | 'upload';

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
    userId,
    currentSchedule,
    onSave,
    onClose,
    isFirstTime = false
}) => {
    const [schedule, setSchedule] = useState<ScheduleBlock[]>(currentSchedule.length > 0 ? currentSchedule : DEFAULT_SCHEDULE);
    const [inputMode, setInputMode] = useState<InputMode>('manual');
    const [pasteText, setPasteText] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isParsingFile, setIsParsingFile] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addActivity = () => {
        const newId = `custom-${Date.now()}`;
        const lastBlock = schedule[schedule.length - 1];
        const newStart = lastBlock ? lastBlock.end : '09:00';

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
            setInputMode('manual');
            setPasteText('');
            setErrors([]);
        } else {
            setErrors(['Could not parse timetable. Please use format: "HH:MM - HH:MM Activity Name"']);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsingFile(true);
        setErrors([]);
        setUploadedFileName(file.name);

        try {
            const parsed = await parseScheduleFile(file);
            if (parsed.length > 0) {
                setSchedule(parsed);
                setInputMode('manual');
                setErrors([]);
            } else {
                setErrors([
                    'Could not extract schedule from file.',
                    'Make sure your file contains time entries like "09:00 - 12:00 Study"',
                    'Try using the Paste or Manual entry options instead.'
                ]);
            }
        } catch (error: any) {
            console.error('File parsing error:', error);
            // Split multi-line error messages into array
            const errorMessage = error.message || 'Failed to parse file. Please check the format.';
            const errorLines = errorMessage.split('\n').filter((line: string) => line.trim());
            setErrors(errorLines);
        } finally {
            setIsParsingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
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

                    {/* Mode Toggle - 3 options */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setInputMode('manual')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${inputMode === 'manual'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <iconify-icon icon="lucide:edit-3" width="14"></iconify-icon>
                            Manual
                        </button>
                        <button
                            onClick={() => setInputMode('paste')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${inputMode === 'paste'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <iconify-icon icon="lucide:clipboard-paste" width="14"></iconify-icon>
                            Paste
                        </button>
                        <button
                            onClick={() => setInputMode('upload')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${inputMode === 'upload'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <iconify-icon icon="lucide:file-up" width="14"></iconify-icon>
                            Upload File
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Upload Mode */}
                    {inputMode === 'upload' && (
                        <div className="space-y-4">
                            <div className="text-center py-8">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf,.xlsx,.xls,.csv,.txt"
                                    className="hidden"
                                />

                                {isParsingFile ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <iconify-icon icon="lucide:loader-2" width="32" className="text-purple-400 animate-spin"></iconify-icon>
                                        </div>
                                        <p className="text-white font-medium">Parsing {uploadedFileName}...</p>
                                        <p className="text-sm text-slate-400">Extracting schedule from your file</p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full max-w-md mx-auto p-8 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group cursor-pointer"
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                                    <iconify-icon icon="lucide:upload-cloud" width="32" className="text-slate-400 group-hover:text-purple-400 transition-colors"></iconify-icon>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium mb-1">Upload Your Timetable</p>
                                                    <p className="text-sm text-slate-500">PDF, Excel, or Text file</p>
                                                </div>
                                            </div>
                                        </button>

                                        <div className="mt-6 p-4 bg-white/5 rounded-lg max-w-md mx-auto">
                                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                                <iconify-icon icon="lucide:info" width="16" className="text-blue-400"></iconify-icon>
                                                Supported Formats
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <iconify-icon icon="lucide:file-spreadsheet" width="16" className="text-green-400"></iconify-icon>
                                                    Excel (.xlsx, .xls)
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <iconify-icon icon="lucide:file-text" width="16" className="text-red-400"></iconify-icon>
                                                    PDF (.pdf)
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <iconify-icon icon="lucide:file" width="16" className="text-blue-400"></iconify-icon>
                                                    Text (.txt)
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <iconify-icon icon="lucide:table" width="16" className="text-amber-400"></iconify-icon>
                                                    CSV (.csv)
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-500 mt-3">
                                                Make sure your file contains times in format like:<br />
                                                <code className="text-purple-300">09:00 - 12:00 Study Session</code>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Paste Mode */}
                    {inputMode === 'paste' && (
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
                                className="w-full py-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <iconify-icon icon="lucide:wand-2" width="16"></iconify-icon>
                                Parse Timetable
                            </button>
                        </div>
                    )}

                    {/* Manual Mode */}
                    {inputMode === 'manual' && (
                        <div className="space-y-3">
                            {schedule.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <iconify-icon icon="lucide:calendar-plus" width="32" className="mb-2 opacity-50"></iconify-icon>
                                    <p className="text-sm">No activities yet. Click "Add Activity" to start.</p>
                                </div>
                            ) : (
                                schedule.map((block, index) => (
                                    <div
                                        key={block.id}
                                        className="p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs text-slate-500 font-mono w-6">{index + 1}.</span>
                                            <div className="flex-1 flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={block.start}
                                                    onChange={(e) => updateActivity(block.id, 'start', e.target.value)}
                                                    className="px-2 py-1.5 bg-black/60 border border-white/10 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                                />
                                                <span className="text-slate-500">-</span>
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
                                            <input
                                                type="text"
                                                value={block.activity}
                                                onChange={(e) => updateActivity(block.id, 'activity', e.target.value)}
                                                placeholder="Activity name"
                                                className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                            />

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
                                ))
                            )}

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
