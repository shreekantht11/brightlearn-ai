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

  // Use YouTube's enablejsapi to allow polling via postMessage
  const src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&start=${startAt}&rel=0&modestbranding=1`;

  useEffect(() => {
    if (!onTimeUpdate) return;

    const poll = () => {
      iframeRef.current?.contentWindow?.postMessage(
        '{"event":"command","func":"getCurrentTime","args":""}',
        "*"
      );
    };

    // Poll every 5 seconds
    pollRef.current = setInterval(poll, 5000);

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.info?.currentTime !== undefined && data?.info?.duration !== undefined) {
          onTimeUpdate(data.info.currentTime, data.info.duration);
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      clearInterval(pollRef.current);
      window.removeEventListener("message", handleMessage);
    };
  }, [onTimeUpdate, videoId]);

  return (
    <div className="rounded-2xl overflow-hidden bg-foreground/5 border border-border shadow-lg">
      <div className="aspect-video">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
