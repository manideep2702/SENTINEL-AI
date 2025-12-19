import React, { useState, useRef, useEffect } from 'react';
import { ScheduleBlock, VerificationResult } from '../types';
import { analyzeProof } from '../services/geminiService';
import { completeVerification } from '../services/verificationService';
import { useAuth } from '../contexts/AuthContext';
import { DAILY_SCHEDULE } from '../constants';

interface UploaderProps {
    currentBlock: ScheduleBlock | null;
    onVerificationComplete: (blockId: string, result: VerificationResult) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ currentBlock, onVerificationComplete }) => {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(currentBlock);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Update selected block when current block changes
        if (currentBlock) {
            setSelectedBlock(currentBlock);
        }
    }, [currentBlock]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setSaveStatus('idle');
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setSaveStatus('idle');
    };

    const handleUpload = async () => {
        if (!file || !selectedBlock) return;
        setIsAnalyzing(true);
        setSaveStatus('idle');

        try {
            // Step 1: Analyze with AI
            const result = await analyzeProof(file, selectedBlock.activity);

            // Check if it's trash content
            if (!result.task_verified && result.focus_score === 0 &&
                result.distractions_detected.includes("Trash Content")) {
                alert("❌ Trash submission detected! Upload real proof of your work.");
                setIsAnalyzing(false);
                return;
            }

            // Step 2: Save to backend if user is logged in
            if (user) {
                setIsSaving(true);
                setSaveStatus('saving');
                try {
                    await completeVerification(
                        file,
                        selectedBlock.id,
                        selectedBlock.activity,
                        user.id,
                        result
                    );
                    setSaveStatus('saved');
                    console.log('✅ Verification saved to backend successfully');
                } catch (saveError) {
                    console.error('Failed to save to backend:', saveError);
                    setSaveStatus('error');
                    // Continue with local state even if backend save fails
                }
                setIsSaving(false);
            } else {
                console.log('ℹ️ User not logged in - verification saved locally only');
            }

            // Step 3: Update local state
            onVerificationComplete(selectedBlock.id, result);

            // Clean up after success
            handleRemoveFile();
        } catch (err) {
            console.error('Verification failed:', err);
            alert("⚠️ Verification failed. Please try again.");
            setSaveStatus('error');
        } finally {
            setIsAnalyzing(false);
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full w-full relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                            <iconify-icon icon="lucide:upload-cloud" width="16" className="text-purple-400"></iconify-icon>
                            Evidence Upload
                        </h3>

                        {/* Task Selector */}
                        <div className="mb-3">
                            <label className="text-xs text-slate-500 mb-2 block">Select Activity to Verify</label>
                            <select
                                value={selectedBlock?.id || ''}
                                onChange={(e) => {
                                    const block = DAILY_SCHEDULE.find(b => b.id === e.target.value);
                                    setSelectedBlock(block || null);
                                }}
                                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-md text-sm text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                            >
                                <option value="">Choose an activity...</option>
                                {DAILY_SCHEDULE.map(block => (
                                    <option key={block.id} value={block.id}>
                                        {block.activity} ({block.start} - {block.end})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedBlock && (
                            <p className="text-xs text-slate-500">
                                Submit proof for <span className="text-purple-300 border-b border-purple-500/30">{selectedBlock.activity}</span>
                            </p>
                        )}
                    </div>
                    {isAnalyzing && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] text-purple-300 font-mono animate-pulse">ANALYZING</span>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*,image/*"
                    className="hidden"
                />

                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border border-dashed border-white/10 rounded-lg bg-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group/upload"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/upload:bg-purple-500/10 transition-colors">
                            <iconify-icon icon="lucide:plus" width="24" className="text-slate-500 group-hover/upload:text-purple-400 transition-colors"></iconify-icon>
                        </div>
                        <span className="text-xs text-slate-400 font-medium group-hover/upload:text-slate-200 transition-colors">Click to Select File</span>
                        <span className="text-[10px] text-slate-600 mt-1">Supports Video & Image</span>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Preview Container */}
                        <div className="relative flex-1 bg-black rounded-lg border border-white/10 overflow-hidden mb-4 group/preview">
                            {file.type.startsWith('video') ? (
                                <video
                                    src={previewUrl || ''}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                />
                            ) : (
                                <img
                                    src={previewUrl || ''}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            )}
                            <button
                                onClick={handleRemoveFile}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                            >
                                <iconify-icon icon="lucide:x" width="14"></iconify-icon>
                            </button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                                {file.name}
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={isAnalyzing || !selectedBlock}
                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <iconify-icon icon="lucide:loader-2" width="14" className="animate-spin"></iconify-icon>
                                        PROCESSING
                                    </>
                                ) : (
                                    <>
                                        VERIFY NOW
                                        <iconify-icon icon="lucide:arrow-right" width="14"></iconify-icon>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};