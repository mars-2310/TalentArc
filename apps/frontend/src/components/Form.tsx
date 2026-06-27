import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "../lib/config";

export function Form() {
  const navigate = useNavigate();

  const [github, setGithub] = useState("");
  const [LinkedIn, setLinkedIn] = useState("");
  
  const handleSubmit = async () => {
    let message = "";
    if(!github && !LinkedIn) {
      message = "Enter valid GitHub and LinkedIn URLs.";
    } else if(!github){
      message = "Enter valid GItHub URL."
    } else if(!LinkedIn){
      message = "Enter valid LinkedIn URL."
    };
    if(message){
      toast(message, {position: "top-center"});
      return;
    };
    const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
      github,
      LinkedIn
    })
    navigate(`/interview/${response.data.id}`);
  };
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        AI Interview Kickstarter
      </h2>
      <div className="p-2">
        <Input placeholder="LinkedIn URL" value={LinkedIn} onChange={(e) => setLinkedIn(e.target.value)} className="p-4"/>
      </div>
      <div className="p-2">
        <Input placeholder="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} className="p-4"/>
      </div>
      <div className="p-4">
        <Button className="flex justify-center p-4"
          onClick = {handleSubmit}>Start Interview</Button>
      </div>
    </div>
  );
}