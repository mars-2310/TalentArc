import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import {
  Award,
  MessageSquare,
  Clock,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Sparkles,
  User,
  Loader2,
  CheckCircle2,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface TranscriptMessage {
  type: "Assistant" | "User";
  content: string;
  createdAt: string;
}

interface ResultData {
  transcript: TranscriptMessage[];
  score: number;
  feedBack: string;
  status: "Done" | "InProgress" | "Pre";
}

export function Result() {
  const [result, setResult] = useState<ResultData>({
    transcript: [],
    score: 0,
    feedBack: "",
    status: "Pre",
  });

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const { interviewId } = useParams();
  const navigate = useNavigate();

  // Loading text cycler
  const loadingTexts = [
    "Compiling your interview response data...",
    "Analyzing technical correctness of your code explanations...",
    "Evaluating verbal communication and delivery metrics...",
    "Generating constructive feedback and overall score...",
    "Finalizing report scorecard. Almost ready...",
  ];

  useEffect(() => {
    if (result.status === "Done") return;
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [result.status]);

  useEffect(() => {
    if (!interviewId) return;

    const fetchResult = () => {
      axios
        .get(`${BACKEND_URL}/api/v1/results/${interviewId}`)
        .then((response) => {
          const data = response.data;
          setResult({
            transcript: data.transcript || [],
            score: data.score ?? 0,
            feedBack: data.feedBack || data.feedback || "",
            status: data.status,
          });
        })
        .catch((err) => {
          console.error("Error fetching results:", err);
        });
    };

    fetchResult();

    // Poll every 4 seconds if the session is not done yet
    const intervalId = setInterval(() => {
      fetchResult();
    }, 4000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  // Clean up and stop polling once status is Done
  useEffect(() => {
    if (result.status === "Done") {
      toast.success("Feedback report loaded successfully!");
    }
  }, [result.status]);

  const handleRestart = () => {
    navigate("/");
  };

  // Score description helper
  const getScoreDescription = (score: number) => {
    if (score >= 8)
      return {
        label: "Excellent",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
        glow: "rgba(16,185,129,0.2)",
      };
    if (score >= 6)
      return {
        label: "Good Progress",
        color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        glow: "rgba(99,102,241,0.2)",
      };
    return {
      label: "Needs Practice",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      glow: "rgba(245,158,11,0.2)",
    };
  };

  const scoreInfo = getScoreDescription(result.score);

  // SVG parameters for circular score meter
  const strokeRadius = 52;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  // Score is out of 10
  const scorePercentage = result.score * 10;
  const strokeDashoffset =
    strokeCircumference - (scorePercentage / 100) * strokeCircumference;

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center relative overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] animate-float-slow-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header Console */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-white/[0.08] pb-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-indigo-300 tracking-wider uppercase backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Performance Report
          </div>
        </div>
        <Button
          onClick={handleRestart}
          variant="outline"
          className="border-white/[0.08] text-slate-300 bg-white/[0.02] hover:bg-white/[0.08] hover:text-white flex items-center gap-2 rounded-lg cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Start New
        </Button>
      </header>

      {/* LOADING / EVALUATION STATE */}
      {result.status !== "Done" && (
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-md w-full py-16">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center gap-6 shadow-2xl border-white/[0.08] w-full">
            <div className="relative h-16 w-16 flex items-center justify-center">
              {/* Spinning background track */}
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
              <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-slate-100">
                AI Evaluator is Grading
              </h3>
              <p className="text-xs text-slate-400">
                Our evaluation pipeline calculates grading metrics out of 10
                based on correctness and communication.
              </p>
            </div>

            <div className="w-full bg-slate-900/50 border border-white/[0.04] p-4 rounded-xl flex items-center justify-center text-sm text-indigo-300 font-medium font-mono min-h-[60px] animate-pulse">
              {loadingTexts[loadingTextIndex]}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED RESULTS DASHBOARD */}
      {result.status === "Done" && (
        <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8 flex-1">
          {/* Summary Score Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border-white/[0.08]">
            <div className="flex items-center gap-5">
              {/* Circular gauge */}
              <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  {/* Outer circle track */}
                  <circle
                    cx="56"
                    cy="56"
                    r={strokeRadius}
                    className="stroke-slate-900 fill-none"
                    strokeWidth="8"
                  />
                  {/* Active progress track */}
                  <circle
                    cx="56"
                    cy="56"
                    r={strokeRadius}
                    className="stroke-indigo-500 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={strokeCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 6px ${scoreInfo.glow})`,
                    }}
                  />
                </svg>
                {/* Score numbers inside */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-mono tracking-tight text-white">
                    {result.score}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Scale / 10
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                    Evaluation Scorecard
                  </h2>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${scoreInfo.color}`}
                  >
                    {scoreInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Your mock session report is ready. It analyzes technical
                  accuracy, architectural design, clarity, confidence, and
                  language fluency.
                </p>
              </div>
            </div>

            <Button
              onClick={handleRestart}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold px-6 py-5 rounded-lg shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              <span>Practice Again</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Detailed Content: Report & History Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: AI Feedback Report */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/[0.08] lg:col-span-7 flex flex-col gap-6 shadow-xl">
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Interviewer Insights
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Structured critique compiled by technical evaluators.
                  </p>
                </div>
              </div>

              {/* Feedback Content Text block */}
              <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-4 whitespace-pre-line bg-slate-900/20 p-5 rounded-xl border border-white/[0.03]">
                {result.feedBack ? (
                  result.feedBack
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 text-xs py-4">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    No written feedback comments found.
                  </div>
                )}
              </div>

              {/* Summary bullets based on score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-lg flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-300">
                      Technical Depth
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Evaluates coding syntax and structural logic.
                    </span>
                  </div>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-lg flex items-start gap-2.5">
                  <ThumbsUp className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-300">
                      Fluency & Tone
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Measures explanations and interview confidence.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chat Transcript History */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/[0.08] lg:col-span-5 flex flex-col gap-6 shadow-xl max-h-[640px]">
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Conversation Log
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Verbatim transcripts captured during calling.
                  </p>
                </div>
              </div>

              {/* Bubbles Scroll Container */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1 py-1 max-h-[460px] scrollbar-thin">
                {result.transcript.length > 0 ? (
                  result.transcript
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                    )
                    .map((msg, i) => {
                      const isUser = msg.type === "User";
                      return (
                        <div
                          key={i}
                          className={`flex flex-col gap-1 w-[85%] ${
                            isUser
                              ? "self-end items-end"
                              : "self-start items-start"
                          }`}
                        >
                          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider px-1">
                            {isUser ? (
                              <>
                                <span>You</span>
                                <User className="h-2.5 w-2.5 text-slate-500" />
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                                <span>AI Interviewer</span>
                              </>
                            )}
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-normal ${
                              isUser
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                                : "bg-white/[0.03] border border-white/[0.06] text-slate-300 rounded-tl-none"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center gap-2">
                    <MessageSquare className="h-8 w-8 text-slate-700" />
                    <span className="text-xs">
                      No transcripts recorded. Did you speak during the session?
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
