import React, { useState, useRef, useEffect } from 'react';
import { ScheduleBlock, VerificationResult } from '../types';
import { analyzeProof } from '../services/geminiService';
import { completeVerification } from '../services/verificationService';
import { useAuth } from '../contexts/AuthContext';
import { useSchedule } from '../contexts/ScheduleContext';

interface UploaderProps {
    currentBlock: ScheduleBlock | null;
    onVerificationComplete: (blockId: string, result: VerificationResult) => void;
}

interface FileWithPreview {
    file: File;
    previewUrl: string;
    id: string;
}

export const Uploader: React.FC<UploaderProps> = ({ currentBlock, onVerificationComplete }) => {
    const { user } = useAuth();
    const { schedule } = useSchedule();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(currentBlock);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Camera recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentBlock) {
            setSelectedBlock(currentBlock);
        }
    }, [currentBlock]);

    useEffect(() => {
        return () => {
            files.forEach(f => URL.revokeObjectURL(f.previewUrl));
            stopRecording();
        };
    }, []);

    // Recording timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setRecordingTime(0);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles: FileWithPreview[] = Array.from(e.target.files).map((file: File) => ({
                file,
                previewUrl: URL.createObjectURL(file),
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }));
            setFiles(prev => [...prev, ...newFiles]);
            setSaveStatus('idle');
        }
    };

    const startRecording = async () => {
        try {
            // Request HIGH QUALITY camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 },
                    frameRate: { ideal: 30, min: 24 }
                },
                audio: true
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Use high quality codec if available
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
                    ? 'video/webm;codecs=vp8'
                    : 'video/webm';

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                videoBitsPerSecond: 5000000 // 5 Mbps for high quality
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
                const previewUrl = URL.createObjectURL(blob);

                setFiles(prev => [...prev, {
                    file,
                    previewUrl,
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }]);

                // Clean up
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorder.start(1000); // Capture every second
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('⚠️ Could not access camera. Please check permissions or use "Take Photo" instead.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsRecording(false);
    };

    const handleCameraCapture = () => {
        // Use native camera capture for best quality on mobile
        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.previewUrl);
            }
            const newFiles = prev.filter(f => f.id !== id);
            if (currentFileIndex >= newFiles.length && newFiles.length > 0) {
                setCurrentFileIndex(newFiles.length - 1);
            }
            return newFiles;
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setSaveStatus('idle');
    };

    const handleRemoveAllFiles = () => {
        files.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
        setCurrentFileIndex(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setSaveStatus('idle');
    };

    const handleUpload = async () => {
        if (files.length === 0 || !selectedBlock) return;
        setIsAnalyzing(true);
        setSaveStatus('idle');

        try {
            const primaryFile = files[0].file;
            const result = await analyzeProof(primaryFile, selectedBlock.activity);

            if (!result.task_verified && result.focus_score === 0 &&
                result.distractions_detected.includes("Trash Content")) {
                alert("❌ Trash submission detected! Upload real proof of your work.");
                setIsAnalyzing(false);
                return;
            }

            if (result.distractions_detected.includes("API Key Not Configured")) {
                console.warn('AI verification not available - proceeding without AI analysis');
            }

            if (user) {
                setIsSaving(true);
                setSaveStatus('saving');
                try {
                    await completeVerification(
                        primaryFile,
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
                }
                setIsSaving(false);
            } else {
                console.log('ℹ️ User not logged in - verification saved locally only');
            }

            onVerificationComplete(selectedBlock.id, result);
            handleRemoveAllFiles();
        } catch (err) {
            console.error('Verification failed:', err);
            alert("⚠️ Verification failed. Please try again.");
            setSaveStatus('error');
        } finally {
            setIsAnalyzing(false);
            setIsSaving(false);
        }
    };

    const currentFile = files[currentFileIndex];

    return (
        <div className="h-full w-full relative group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 h-full flex flex-col p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                            <iconify-icon icon="lucide:upload-cloud" width="16" className="text-purple-400"></iconify-icon>
                            Evidence Upload
                            {files.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded-full">
                                    {files.length} file{files.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </h3>

                        <div className="mb-3">
                            <label className="text-xs text-slate-500 mb-2 block">Select Activity to Verify</label>
                            <select
                                value={selectedBlock?.id || ''}
                                onChange={(e) => {
                                    const block = schedule.find(b => b.id === e.target.value);
                                    setSelectedBlock(block || null);
                                }}
                                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-md text-sm text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                            >
                                <option value="">Choose an activity...</option>
                                {schedule.map(block => (
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

                {/* Hidden file inputs */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*,image/*"
                    multiple
                    className="hidden"
                />

                {/* Camera capture input - uses native camera app for best quality */}
                <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                />

                {/* Recording overlay */}
                {isRecording && (
                    <div className="fixed inset-0 z-50 bg-black flex flex-col">
                        <video
                            ref={videoRef}
                            className="flex-1 object-cover"
                            autoPlay
                            muted
                            playsInline
                        />
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-red-500/90 rounded-full">
                            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                            <span className="text-white font-mono font-bold">{formatTime(recordingTime)}</span>
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                            <button
                                onClick={stopRecording}
                                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                            </button>
                        </div>
                    </div>
                )}

                {files.length === 0 && !isRecording ? (
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Main upload area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 border border-dashed border-white/10 rounded-lg bg-black/20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group/upload"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/upload:bg-purple-500/10 transition-colors">
                                <iconify-icon icon="lucide:image-plus" width="24" className="text-slate-500 group-hover/upload:text-purple-400 transition-colors"></iconify-icon>
                            </div>
                            <span className="text-xs text-slate-400 font-medium group-hover/upload:text-slate-200 transition-colors">Select from Gallery</span>
                            <span className="text-[10px] text-slate-600 mt-1">Photos & Videos</span>
                        </div>

                        {/* Camera buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCameraCapture}
                                className="flex-1 py-3 px-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-colors"
                            >
                                <iconify-icon icon="lucide:camera" width="18" className="text-emerald-400"></iconify-icon>
                                <span className="text-xs font-medium text-emerald-300">Take Photo</span>
                            </button>
                            <button
                                onClick={startRecording}
                                className="flex-1 py-3 px-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors"
                            >
                                <iconify-icon icon="lucide:video" width="18" className="text-red-400"></iconify-icon>
                                <span className="text-xs font-medium text-red-300">Record Video</span>
                            </button>
                        </div>
                    </div>
                ) : files.length > 0 ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="relative flex-1 bg-black rounded-lg border border-white/10 overflow-hidden mb-4 group/preview">
                            {currentFile && (
                                <>
                                    {currentFile.file.type.startsWith('video') ? (
                                        <video
                                            src={currentFile.previewUrl}
                                            className="w-full h-full object-contain"
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                        />
                                    ) : (
                                        <img
                                            src={currentFile.previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </>
                            )}

                            {files.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentFileIndex(prev => prev > 0 ? prev - 1 : files.length - 1)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-purple-500/80 transition-colors backdrop-blur-sm"
                                    >
                                        <iconify-icon icon="lucide:chevron-left" width="16"></iconify-icon>
                                    </button>
                                    <button
                                        onClick={() => setCurrentFileIndex(prev => prev < files.length - 1 ? prev + 1 : 0)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full hover:bg-purple-500/80 transition-colors backdrop-blur-sm"
                                    >
                                        <iconify-icon icon="lucide:chevron-right" width="16"></iconify-icon>
                                    </button>
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                                        {currentFileIndex + 1} / {files.length}
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => currentFile && handleRemoveFile(currentFile.id)}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-sm"
                            >
                                <iconify-icon icon="lucide:x" width="14"></iconify-icon>
                            </button>
                        </div>

                        {files.length > 1 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                {files.map((f, index) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setCurrentFileIndex(index)}
                                        className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${index === currentFileIndex
                                            ? 'border-purple-500 ring-2 ring-purple-500/30'
                                            : 'border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {f.file.type.startsWith('video') ? (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <iconify-icon icon="lucide:video" width="16" className="text-slate-400"></iconify-icon>
                                            </div>
                                        ) : (
                                            <img src={f.previewUrl} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors"
                                >
                                    <iconify-icon icon="lucide:plus" width="16" className="text-slate-400"></iconify-icon>
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                            <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
                                {currentFile?.file.name}
                            </div>
                            <div className="flex gap-2">
                                {files.length > 1 && (
                                    <button
                                        onClick={handleRemoveAllFiles}
                                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={handleUpload}
                                    disabled={isAnalyzing || !selectedBlock}
                                    className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
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
                    </div>
                ) : null}
            </div>
        </div>
    );
};