"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, SkipBack, SkipForward, Bookmark } from "lucide-react";

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
        <div className="flex flex-col gap-3 mb-6">
            <div className="bg-[#161618] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-white shadow-xl">
                <audio ref={audioRef} src={url} className="hidden" />

                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => skip(-10)} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                        <SkipBack className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                    <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black rounded-full transition-colors cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        {isPlaying ? <Pause className="w-5 h-5 ml-0" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button onClick={() => skip(10)} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                        <SkipForward className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                </div>

                <div className="flex-1 w-full flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 h-1.5 flex items-center">
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 z-10"
                            />
                            {/* Chapter Markers */}
                            {duration > 0 && chapters.map((chapter, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 w-0.5 h-1.5 bg-white/40 z-0"
                                    style={{ left: `${(chapter.startTime / duration) * 100}%` }}
                                    title={chapter.title}
                                ></div>
                            ))}
                        </div>
                        <span className="text-gray-400 w-10">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Volume2 className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs uppercase tracking-wider">Recording</span>
                </div>
            </div>

            {/* Chapter List */}
            {chapters.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {chapters.map((chapter, i) => (
                        <button
                            key={i}
                            onClick={() => seekTo(chapter.startTime)}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Bookmark className="w-3 h-3 text-cyan-500/50" />
                            {chapter.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
