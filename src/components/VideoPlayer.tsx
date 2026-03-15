import { useEffect, useRef } from "react";
import { Clock, PlayCircle } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  startAt?: number;
  durationLabel?: string;
  eyebrow?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const VideoPlayer = ({ videoId, title, startAt = 0, durationLabel, eyebrow, onTimeUpdate }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&start=${startAt}&rel=0&modestbranding=1`;

  useEffect(() => {
    if (!onTimeUpdate) return;
    const poll = () => {
      iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"getCurrentTime","args":""}', "*");
    };
    pollRef.current = setInterval(poll, 5000);
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.info?.currentTime !== undefined && data?.info?.duration !== undefined) {
          onTimeUpdate(data.info.currentTime, data.info.duration);
        }
      } catch {
        // Ignore non-YouTube postMessage events
      }
    };
    window.addEventListener("message", handleMessage);
    return () => { clearInterval(pollRef.current); window.removeEventListener("message", handleMessage); };
  }, [onTimeUpdate, videoId]);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-lg">
      <div className="absolute -inset-[1px] -z-10 rounded-[2rem] bg-gradient-to-r from-primary/20 via-cyan-300/10 to-accent-foreground/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
      <div className="border-b border-border bg-[linear-gradient(135deg,_rgba(15,23,42,1)_0%,_rgba(30,41,59,1)_55%,_rgba(49,46,129,1)_100%)] p-5 text-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            <PlayCircle className="h-3.5 w-3.5" />
            {eyebrow || "Lesson video"}
          </div>
          {durationLabel && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
              <Clock className="h-3.5 w-3.5" />
              {durationLabel}
            </div>
          )}
        </div>
        <h2 className="mt-4 text-xl font-black leading-tight sm:text-2xl">{title}</h2>
      </div>
      <div className="aspect-video bg-slate-950">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
