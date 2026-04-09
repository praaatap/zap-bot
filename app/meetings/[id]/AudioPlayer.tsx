"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward, Bookmark, Activity } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function AudioPlayer({
    url,
    chapters = []
}: {
    url: string,
    chapters?: { title: string, startTime: number }[]
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const onEnd = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", onEnd);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", onEnd);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const time = Number(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const skip = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime += seconds;
    };

    const seekTo = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = seconds;
        if (!isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    if (!url) return null;

    return (
        <div className="flex flex-col gap-4 mb-10">
            <div className="pro-card p-6 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <audio ref={audioRef} src={url} className="hidden" />

                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => skip(-10)} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-white">
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 flex items-center justify-center bg-white hover:bg-zinc-200 text-black rounded-2xl transition-all shadow-[0_8px_30px_rgb(255,255,255,0.1)] active:scale-95 group/play"
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
                    </button>
                    <button onClick={() => skip(10)} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-zinc-500 hover:text-white">
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase italic">
                        <span className="text-white w-12">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 h-1.5 flex items-center">
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-white z-10 hover:accent-cyan-400 transition-all"
                            />
                            {/* Chapter Markers */}
                            {duration > 0 && chapters.map((chapter, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 w-px h-1.5 bg-white/20 z-0"
                                    style={{ left: `${(chapter.startTime / duration) * 100}%` }}
                                ></div>
                            ))}
                        </div>
                        <span className="text-zinc-500 w-12 text-right">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/40 text-zinc-200 shadow-lg shadow-cyan-500/20 animate-in fade-in duration-500">
                    <div className="relative">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <div className="absolute inset-0 w-3.5 h-3.5 bg-cyan-400/30 rounded-full animate-blob blur-sm"></div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Live Stream</span>
                </div>
            </div>

            {/* Chapter List */}
            {chapters.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {chapters.map((chapter, i) => (
                        <button
                            key={i}
                            onClick={() => seekTo(chapter.startTime)}
                            className="shrink-0 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/10 transition-all flex items-center gap-3 italic"
                        >
                            <Bookmark className="w-3 h-3 text-cyan-500/30" />
                            {chapter.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
