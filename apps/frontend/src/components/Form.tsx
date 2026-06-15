import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

export function Form() {
  const navigate = useNavigate();

  const [github, setGithub] = useState("");
  const [LinkedIn, setLinkedIn] = useState("");
  
  const handleSubmit = () => {
    console.log(LinkedIn);
    console.log(github);
    navigate("/");
  };
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        AI Interview Kickstarter
      </h2>
      <div className="p-2">
        <Input placeholder="LinkedIn URL" className="p-4"/>
      </div>
      <div className="p-2">
        <Input placeholder="GitHub URL" className="p-4"/>
      </div>
      <div className="p-4">
        <Button className="flex justify-center p-4"
          onClick = {handleSubmit}>Start Interview</Button>
      </div>
    </div>
  );
}