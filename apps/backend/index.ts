import express from "express";
import { preInterviewBody } from "./types";
import axios from "axios";
import cors from "cors";
import { prisma } from "./db";

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

    res.json({id: interview.id});
});

app.post("/api/v1/session", async (req, res) => {
  const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
  });

  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: fd,
    });
    // Send back the SDP we received from the OpenAI REST API
    const sdp = await r.text();
    res.send(sdp);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  };
})

app.listen(3001);