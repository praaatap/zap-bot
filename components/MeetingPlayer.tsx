"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, RotateCcw, Volume2, Maximize2, Download, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    recordingUrl: string;
    title: string;
    startTime: string;
}

export default function MeetingPlayer({ isOpen, onClose, recordingUrl, title, startTime }: MeetingPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(current);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = (val / 100) * videoRef.current.duration;
            setProgress(val);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[1000px] aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                    >
                        {/* Video Layer */}
                        <video
                            ref={videoRef}
                            src={recordingUrl}
                            className="w-full h-full object-cover"
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                            onClick={togglePlay}
                        />

                        {/* Custom Controls Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-4">
                            
                            {/* Top Bar (Title) */}
                            <div className="absolute top-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex flex-col">
                                    <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
                                    <div className="flex items-center gap-2 text-white/60 text-xs mt-1">
                                        <Clock size={12} />
                                        <span>{formatTime(startTime)}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative group/progress">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={progress}
                                    onChange={handleProgressChange}
                                    className="w-full h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer accent-indigo-500 overflow-hidden"
                                />
                            </div>

                            {/* Controls Bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition">
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                    </button>
                                    <button className="text-white hover:text-indigo-400 transition">
                                        <RotateCcw size={21} />
                                    </button>
                                    <div className="flex items-center gap-3 text-white">
                                        <Volume2 size={21} />
                                        <div className="w-20 h-1 bg-white/20 rounded-full relative">
                                            <div className="absolute inset-y-0 left-0 bg-white rounded-full w-2/3" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="h-9 px-4 flex items-center gap-2 rounded-full bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition">
                                        <Download size={14} />
                                        Save Recording
                                    </button>
                                    <button className="text-white hover:text-indigo-400 transition">
                                        <Maximize2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Big Play Overlay (Initial state) */}
                        {!isPlaying && progress === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group pointer-events-none">
                                <div className="h-24 w-24 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-indigo-500/30 shadow-2xl scale-110">
                                    <Play size={40} fill="currentColor" className="ml-2" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
