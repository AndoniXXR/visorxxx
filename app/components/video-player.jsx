'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
export function VideoPlayer({ src, poster }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const timeoutRef = useRef(undefined);
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            if (isMuted) {
                videoRef.current.volume = 0;
            }
        }
    }, []);
    const togglePlay = () => __awaiter(this, void 0, void 0, function* () {
        if (!videoRef.current)
            return;
        try {
            if (isPlaying) {
                yield videoRef.current.pause();
            }
            else {
                const playPromise = videoRef.current.play();
                if (playPromise) {
                    yield playPromise;
                }
            }
            setIsPlaying(!isPlaying);
        }
        catch (error) {
            console.error("Error playing video:", error);
            setError("Error al reproducir el video");
        }
    });
    const handleTimeUpdate = () => {
        if (!videoRef.current)
            return;
        setCurrentTime(videoRef.current.currentTime);
    };
    const handleLoadedMetadata = () => {
        if (!videoRef.current)
            return;
        setDuration(videoRef.current.duration);
        setIsLoading(false);
    };
    const handleLoadedData = () => {
        setIsLoading(false);
    };
    const handleWaiting = () => {
        setIsLoading(true);
    };
    const handlePlaying = () => {
        setIsLoading(false);
        setError(null);
    };
    const handleError = () => {
        setError("Error al cargar el video");
        setIsLoading(false);
    };
    const handlePlay = () => {
        setIsPlaying(true);
        setError(null);
    };
    const handlePause = () => {
        setIsPlaying(false);
    };
    const handleSeek = (e) => {
        const time = Number.parseFloat(e.target.value);
        if (!videoRef.current)
            return;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };
    const handleVolumeChange = (e) => {
        const vol = Number.parseFloat(e.target.value);
        if (!videoRef.current)
            return;
        videoRef.current.volume = vol;
        setVolume(vol);
        setIsMuted(vol === 0);
    };
    const toggleMute = () => {
        if (!videoRef.current)
            return;
        if (isMuted) {
            videoRef.current.volume = volume;
            setIsMuted(false);
        }
        else {
            videoRef.current.volume = 0;
            setIsMuted(true);
        }
    };
    const toggleFullscreen = () => __awaiter(this, void 0, void 0, function* () {
        if (!containerRef.current)
            return;
        try {
            if (!isFullscreen) {
                yield containerRef.current.requestFullscreen();
            }
            else {
                yield document.exitFullscreen();
            }
            setIsFullscreen(!isFullscreen);
        }
        catch (error) {
            console.error("Fullscreen error:", error);
        }
    });
    const handleKeyDown = (e) => {
        if (!videoRef.current)
            return;
        switch (e.code) {
            case "Space":
                e.preventDefault();
                togglePlay();
                break;
            case "ArrowLeft":
                e.preventDefault();
                videoRef.current.currentTime -= 5;
                break;
            case "ArrowRight":
                e.preventDefault();
                videoRef.current.currentTime += 5;
                break;
            case "ArrowUp":
                e.preventDefault();
                setVolume(Math.min(1, volume + 0.1));
                videoRef.current.volume = Math.min(1, volume + 0.1);
                setIsMuted(false);
                break;
            case "ArrowDown":
                e.preventDefault();
                setVolume(Math.max(0, volume - 0.1));
                videoRef.current.volume = Math.max(0, volume - 0.1);
                break;
            case "KeyM":
                e.preventDefault();
                toggleMute();
                break;
            case "KeyF":
                e.preventDefault();
                toggleFullscreen();
                break;
        }
    };
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [volume]);
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return (<div ref={containerRef} className={`relative bg-transparent overflow-hidden group flex items-center justify-center transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full h-full'}`} onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      {error && (<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <Button variant="outline" onClick={() => {
                setError(null);
                if (videoRef.current) {
                    videoRef.current.load();
                }
            }}>
              <RotateCcw className="w-4 h-4 mr-2"/>
              Reintentar
            </Button>
          </div>
        </div>)}

      {isLoading && !error && (<div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400"/>
        </div>)}

      <video ref={videoRef} src={src} poster={poster} className={`w-full h-full object-contain transition-all duration-300 ${isFullscreen ? 'max-w-screen max-h-screen' : 'max-w-[640px] max-h-[480px]'}`} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onLoadedData={handleLoadedData} onWaiting={handleWaiting} onPlaying={handlePlaying} onPlay={handlePlay} onPause={handlePause} onError={handleError} onClick={togglePlay} preload="metadata" controlsList="nodownload" playsInline/>

      {/* Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 transition-all duration-200 ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer group">
          <input type="range" min={0} max={duration} step={0.1} value={currentTime} onChange={handleSeek} className="absolute w-full h-full opacity-0 cursor-pointer"/>
          <div className="h-full bg-purple-500 relative" style={{ width: `${(currentTime / duration) * 100}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"/>
          </div>
        </div>

        {/* Controls bar */}
        <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 pt-12 flex items-center gap-4">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-purple-300 transition-colors">
            {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
          </button>

          {/* Time */}
          <div className="text-sm text-white/90 font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Volume */}
          <div className="relative group flex items-center gap-2">
            <button onClick={toggleMute} className="text-white hover:text-purple-300 transition-colors">
              {isMuted || volume === 0 ? (<VolumeX className="w-6 h-6"/>) : volume < 0.5 ? (<Volume2 className="w-6 h-6 opacity-75"/>) : (<Volume2 className="w-6 h-6"/>)}
            </button>
            <div className={`w-20 transition-all duration-200 ${showControls ? "opacity-100 w-20" : "opacity-0 w-0"}`}>
              <div className="relative w-full px-1">
                <input type="range" min={0} max={1} step={0.1} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:transition-all 
                    [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:hover:bg-purple-500
                    [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:transition-all
                    [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:hover:bg-purple-500" style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
        }}/>
              </div>
            </div>
          </div>

          <div className="flex-grow"/>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-purple-300 transition-colors">
            {isFullscreen ? <Minimize className="w-6 h-6"/> : <Maximize className="w-6 h-6"/>}
          </button>
        </div>
      </div>
      
      {/* Click to play overlay */}
      {!isPlaying && !isLoading && !error && (<div className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors" onClick={togglePlay}>
          <div className="p-4 rounded-full bg-purple-500/20 backdrop-blur-sm transform transition-transform hover:scale-110">
            <Play className="w-12 h-12 text-white"/>
          </div>
        </div>)}
    </div>);
}
