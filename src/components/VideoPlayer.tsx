import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  startAt?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const VideoPlayer = ({ videoId, title, startAt = 0, onTimeUpdate }: VideoPlayerProps) => {
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
      } catch {}
    };
    window.addEventListener("message", handleMessage);
    return () => { clearInterval(pollRef.current); window.removeEventListener("message", handleMessage); };
  }, [onTimeUpdate, videoId]);

  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-lg relative group">
      {/* Gradient border glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-primary-glow/20 to-accent-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
      <div className="aspect-video">
        <iframe ref={iframeRef} src={src} title={title} className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    </div>
  );
};

export default VideoPlayer;
