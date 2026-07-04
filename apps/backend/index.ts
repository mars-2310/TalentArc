import express from "express";
import { preInterviewBody } from "./types";
import axios, { create } from "axios";
import cors from "cors";
import { prisma } from "./db";
import { initSideband } from "./sideband";
import { calculateResult } from "./result";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

app.post("/api/v1/pre-interview", async (req, res) => {
    const {success, data} = preInterviewBody.safeParse(req.body);
    if(!success) {
      res.status(411).json({
        message: "Incorrect body"
      });
      return; 
    };
    const githubUrl = data.github;
    const linkedInUrl = data.LinkedIn;

    const githubUsername = githubUrl.replace(/\/+$/, "").split("/").pop();
    const linkedInUsername = linkedInUrl.replace(/\/+$/, "").split("/").pop();

    //SCRAPING GITHUB
    const userRepos = await axios.get(`https://api.github.com/users/${githubUsername}/repos`);
    const filteredUserRepos = userRepos.data.map((x: any) => ({
      description: x.description,
      name: x.name,
      fullname: x.fullname,
      starCount: x.stargazers_count
    }));

    //SCRAPING LinkedIn

    const interview = await prisma.interview.create({
      data: {
        githubMetaData: filteredUserRepos,
        status: "Pre",
      },
    });
    console.log("Created interview:", interview.id);

    res.json({id: interview.id});
});

app.post(`/api/v1/session/:interviewId`, async (req, res) => {
  console.log("Session interviewId:", req.params.interviewId);
  const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
  });

  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  try {
    const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: fd,
    });

    // Location: /v1/realtime/calls/rtc_123456
    const location = sdpResponse.headers.get("Location");
    const callId = location?.split("/").pop();
    console.log(callId);

    // Send back the SDP we received from the OpenAI REST API
    const sdp = await sdpResponse.text();
    res.send(sdp);
    initSideband(callId!, req.params.interviewId);

  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  };
});

app.post(`/api/v1/session/user/response/:interviewId`, async (req, res) => {
  const {message} = req.body;
  await prisma.messages.create({
    data:{
      interviewId: req.params.interviewId,
      type: "User",
      message: message
    }
  });
  res.json("Message saved!");
});

app.get("/api/v1/results/:interviewId", async (req, res) => {
   const interview = await prisma.interview.findFirst({
    where: {
      id: req.params.interviewId
    },
    include: {
      messages: true 
    }
   });

   if(!interview){
    res.json({
      message: "Interview not found"
    })
    return;
   }

   res.json({
      score: interview?.score,
      feedBack: interview?.feedBack,
      status: interview.status,
      transcript: interview?.messages.map((x) => {
        return {
          type: x.type,
          content: x.message,
          createdAt: x.createdAt
        };
      })
   });

   if(interview.status != "Done"){
     const result = await calculateResult(interview.messages);
     await prisma.interview.update({
      where: {
        id: req.params.interviewId
      },
      data: {
        status: "Done",
        feedBack: result.feedback,
        score: result.score
      }
     })
   }
})

app.listen(3001);