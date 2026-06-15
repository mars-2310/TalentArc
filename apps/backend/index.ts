import express from "express";
import { preInterviewBody } from "./types";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

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
    const filteredUserRepos = userRepos.data.map((x: any) => {
      description: x.description,
      name: x.name,
      fullname: x.fullname,
      starCount: x.stargazers_count
    });

    //SCRAPING LinkedIn
})

app.listen(3001);