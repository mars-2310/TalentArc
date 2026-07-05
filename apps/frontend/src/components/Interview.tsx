import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  label: string;
  colorClass: string;
}

export function AudioVisualizer({
  stream,
  isActive,
  label,
  colorClass,
}: AudioVisualizerProps) {
  const [level, setLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      setLevel(0);
      return;
    }

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      if (stream.getAudioTracks().length === 0) return;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Normalize level (average is between 0 and 255)
        setLevel(average / 255);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error("Failed to initialize AudioContext analyzer:", err);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [stream, isActive]);

  const scale = 1 + level * 0.4;
  const ringScale = 1 + level * 1.3;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-2xl border border-white/[0.05] relative overflow-hidden backdrop-blur-xl w-full aspect-square max-w-[280px] shadow-2xl">
      {/* Dynamic expanding ring */}
      <div
        className="absolute rounded-full border border-indigo-500/20 bg-indigo-500/5 transition-all duration-75"
        style={{
          width: "160px",
          height: "160px",
          transform: `scale(${ringScale})`,
          opacity: isActive ? 0.2 + level * 0.8 : 0.05,
          filter: `blur(${isActive ? 2 + level * 6 : 0}px)`,
        }}
      />

      {/* Main voice core */}
      <div
        className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-75 bg-gradient-to-tr ${colorClass} shadow-xl`}
        style={{
          transform: `scale(${scale})`,
          boxShadow: `0 0 ${20 + level * 60}px rgba(99, 102, 241, ${0.15 + level * 0.45})`,
        }}
      >
        <div className="w-[120px] h-[120px] rounded-full bg-slate-950/85 flex flex-col items-center justify-center backdrop-blur-md">
          {/* Animated sound wave bars */}
          <div className="flex items-end justify-center gap-1.5 h-8 mb-2">
            {[1, 2, 3, 4, 5].map((idx) => {
              const speed = [0.8, 1.2, 0.9, 1.4, 1.1][idx - 1]!;
              const baseHeight = [14, 26, 18, 30, 16][idx - 1]!;
              const currentHeight = isActive
                ? Math.max(4, baseHeight * (level * 1.6 + 0.1) * speed)
                : 4;

              return (
                <div
                  key={idx}
                  className="w-1 rounded-full bg-indigo-400 transition-all duration-75"
                  style={{
                    height: `${currentHeight}px`,
                    backgroundColor: isActive ? undefined : "#475569",
                  }}
                />
              );
            })}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
            {label}
          </span>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-400 font-medium z-10 flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${isActive ? (level > 0.05 ? "bg-emerald-500 animate-pulse" : "bg-indigo-400") : "bg-slate-600"}`}
        />
        {isActive
          ? level > 0.05
            ? "Speaking..."
            : "Listening..."
          : "Connecting..."}
      </div>
    </div>
  );
}

export function Interview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const started = useRef(false);

  // Connection and streams states
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [aiStream, setAiStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // References for cleanup
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Timer interval hook
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Main WebRTC & WebSocket initialization
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // Add local audio track for microphone input in the browser
        const ms = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (!active) {
          ms.getTracks().forEach((track) => track.stop());
          return;
        }
        micStreamRef.current = ms;
        setUserStream(ms);

        // Create a peer connection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // Set up to play remote audio from the model
        if (audioRef.current) {
          audioRef.current.autoplay = true;
        }
        pc.ontrack = (e) => {
          if (!active) return;
          if (audioRef.current) {
            audioRef.current.srcObject = e.streams[0]!;
          }
          setAiStream(e.streams[0]!);
          setIsConnected(true);
        };

        const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
          "token",
          "49843a775e0f797e968a6bb4c4ec2fb59fa86bde",
        ]);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!active) {
            socket.close();
            return;
          }
          const mediaRecorder = new MediaRecorder(ms, {
            mimeType: "audio/webm",
          });
          mediaRecorder.start(250);
          mediaRecorder.addEventListener("dataavailable", (event) => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          });
        };

        socket.onmessage = (message) => {
          if (!active) return;
          try {
            const received = JSON.parse(message.data);
            const transcript = received.channel.alternatives[0]?.transcript;
            if (transcript) {
              axios
                .post(
                  `${BACKEND_URL}/api/v1/session/user/response/${interviewId}`,
                  {
                    message: transcript,
                  },
                )
                .catch((err) =>
                  console.error("Failed to post user transcript:", err),
                );
            }
          } catch (e) {
            console.error("Failed to parse transcript message:", e);
          }
        };

        pc.addTrack(ms.getTracks()[0]!);

        const offer = await pc.createOffer();
        if (!active) {
          pc.close();
          return;
        }
        await pc.setLocalDescription(offer);
        console.log("local description set!");

        const sdpResponse = await fetch(
          `${BACKEND_URL}/api/v1/session/${interviewId}`,
          {
            method: "POST",
            body: offer.sdp,
            headers: {
              "Content-Type": "application/sdp",
            },
          },
        );

        if (!sdpResponse.ok) {
          throw new Error("Failed to post sdp offer to backend");
        }

        const sdpText = await sdpResponse.text();
        if (!active) {
          pc.close();
          return;
        }
        const answer = {
          type: "answer" as "answer",
          sdp: sdpText,
        };
        await pc.setRemoteDescription(answer);
      } catch (err) {
        if (active) {
          console.error("Initialization error:", err);
          toast.error("Failed to connect to the interview. Please refresh.");
        }
      }
    })();

    // Cleanup on unmount
    return () => {
      active = false;
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interviewId]);

  const toggleMute = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      toast.info(isMuted ? "Microphone active" : "Microphone muted");
    }
  };

  const handleEndInterview = () => {
    toast.loading("Ending session and evaluating...", { duration: 2000 });
    // Navigate immediately to the results page
    setTimeout(() => {
      navigate(`/result/${interviewId}`);
    }, 1000);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col justify-between items-center relative bg-slate-950 text-slate-100 font-sans p-6">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-float-slow-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-float-slow-2 pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <audio autoPlay ref={audioRef} className="hidden"></audio>

      {/* Header Console */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-indigo-300 tracking-wider uppercase backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Interview Session
          </div>
          {isConnected && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              <Wifi className="h-3 w-3" /> Live
            </div>
          )}
        </div>

        <div className="text-sm font-mono text-slate-400 bg-white/[0.02] border border-white/[0.05] px-3.5 py-1 rounded-full backdrop-blur-sm">
          Elapsed: {formatTime(seconds)}
        </div>
      </header>

      {/* Main visualizer area */}
      <main className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 my-auto w-full max-w-4xl px-4">
        {/* Interviewer AI */}
        <div className="flex flex-col items-center gap-3 w-full md:w-auto">
          <AudioVisualizer
            stream={aiStream}
            isActive={isConnected}
            label="Interviewer AI"
            colorClass="from-blue-500 to-indigo-600"
          />
          <h3 className="text-sm font-semibold text-slate-300">Interviewer</h3>
        </div>

        {/* You */}
        <div className="flex flex-col items-center gap-3 w-full md:w-auto">
          <AudioVisualizer
            stream={isMuted ? null : userStream}
            isActive={isConnected && !isMuted}
            label="You (Mic)"
            colorClass="from-violet-500 to-fuchsia-600"
          />
          <h3 className="text-sm font-semibold text-slate-300">Your Audio</h3>
        </div>
      </main>

      {/* Bottom Console Controls */}
      <footer className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-4">
        <div className="text-xs text-slate-400 max-w-md text-center bg-slate-900/25 border border-white/[0.04] p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>
            Speak clearly when responding. The AI automatically detects silence
            and responds.
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2">
          {/* Mute toggle button */}
          <Button
            onClick={toggleMute}
            className={`p-4 rounded-full border shadow-lg transition-all duration-300 cursor-pointer ${
              isMuted
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/25"
                : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          {/* End session button */}
          <Button
            onClick={handleEndInterview}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2.5 px-8 py-6 rounded-full cursor-pointer shadow-lg shadow-red-500/15 hover:shadow-red-500/25 transition-all duration-300"
          >
            <PhoneOff className="h-4 w-4" />
            <span>End Interview</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
