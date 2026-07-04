import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "../lib/config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Github, Linkedin, Loader2, Sparkles } from "lucide-react";

export function Form() {
  const navigate = useNavigate();
  const [github, setGithub] = useState("");
  const [LinkedIn, setLinkedIn] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    let message = "";
    const cleanGithub = github.trim();
    const cleanLinkedIn = LinkedIn.trim();

    if (!cleanGithub && !cleanLinkedIn) {
      message = "Please enter valid GitHub and LinkedIn URLs.";
    } else if (!cleanLinkedIn) {
      message = "Please enter a valid LinkedIn URL.";
    } else if (!cleanGithub) {
      message = "Please enter a valid GitHub URL.";
    }

    // Basic format checks
    if (!message) {
      if (!cleanLinkedIn.includes("linkedin.com/")) {
        message = "Please enter a valid LinkedIn profile URL.";
      } else if (!cleanGithub.includes("github.com/")) {
        message = "Please enter a valid GitHub profile URL.";
      }
    }

    if (message) {
      toast.error(message, { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        github: cleanGithub,
        LinkedIn: cleanLinkedIn,
      });
      toast.success("Workspace prepared! Redirecting...", { position: "top-center" });
      navigate(`/interview/${response.data.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start interview. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col justify-center items-center relative bg-slate-950 text-slate-100 font-sans">
      {/* Decorative background glow nodes */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-float-slow-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-float-slow-2 pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="flex flex-col items-center relative z-10 w-full px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-indigo-300 mb-4 tracking-wider uppercase backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Next-Gen AI Interviewer
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 pb-2 text-center select-none font-sans">
          TalentArc
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-light max-w-sm text-center mb-8">
          Launch your mock technical interview. We scrape your public GitHub and LinkedIn profile to tailor specific questions just for you.
        </p>

        {/* Form Card */}
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold text-slate-100">Get Started</h2>
            <p className="text-xs text-slate-400">Fill in your professional profiles to kick off the session.</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* LinkedIn Input Group */}
            <div className="flex flex-col gap-2">
              <label htmlFor="linkedin-input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5 text-blue-400" /> LinkedIn Profile
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 pointer-events-none" />
                <Input
                  id="linkedin-input"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={LinkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all rounded-lg pl-10 pr-4 py-6 w-full text-sm placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* GitHub Input Group */}
            <div className="flex flex-col gap-2">
              <label htmlFor="github-input" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5 text-slate-300" /> GitHub Profile
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 pointer-events-none" />
                <Input
                  id="github-input"
                  type="url"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  disabled={loading}
                  className="bg-white/[0.02] border-white/[0.08] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all rounded-lg pl-10 pr-4 py-6 w-full text-sm placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-6 rounded-lg shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Preparing Workspace...</span>
              </>
            ) : (
              <>
                <span>Start Interview</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}