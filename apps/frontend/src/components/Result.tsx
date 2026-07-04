import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useParams } from "react-router";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

interface TranscriptMessage {
  type: "Assistant" | "User";
  content: string;
  createdAt: string;
}

interface Result {
  transcript: TranscriptMessage[];
  score: number;
  feedback: string;
  status: "Done" | "InProgress" | "Pre";
}

export function Result() {
  const [result, setResult] = useState<Result>({
    transcript: [],
    score: 0,
    feedback: "",
    status: "Pre",
  });

  const { interviewId } = useParams();

  useEffect(() => {
    if (!interviewId) return;

    const fetchResult = () => {
      axios
        .get(`${BACKEND_URL}/api/v1/results/${interviewId}`)
        .then((response) => setResult(response.data));
    };

    fetchResult();

    const intervalId = setInterval(fetchResult, 5000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  return (
    <>
    <div>Result</div>
      {result.status === "Done" && (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
          <div>Score — {result.score}</div>

          <div>Feedback — {result.feedback}</div>

          <div className="mt-4">
            {result.transcript
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
              .map((x, i) => (
                <div key={i}>
                  {x.type} - {x.content}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}