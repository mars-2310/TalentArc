import { useParams } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef } from "react";
import { BACKEND_URL } from "@/lib/config";
import { DeepgramClient } from "@deepgram/sdk";
import axios from "axios";

export function Interview(){
  const {interviewId} = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioRef.current!.autoplay = true;
      pc.ontrack = (e) => (audioRef.current!.srcObject = e.streams[0]!);

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const socket = new WebSocket('wss://api.deepgram.com/v1/listen',[
        'token',
        '49843a775e0f797e968a6bb4c4ec2fb59fa86bde'
      ]);

      socket.onopen = () => {
        const mediaRecorder = new MediaRecorder(ms, {mimeType: "audio/webm"});
        mediaRecorder.start(250);
        mediaRecorder.addEventListener('dataavailable', (event) => {
          socket .send(event.data);
        });
      };

      socket.onmessage = (message) => {
        const recieved = JSON.parse(message.data);
        const transcript = recieved.channel.alternatives[0].transcript;
        if(transcript) {
          axios.post(`${BACKEND_URL}/api/v1/session/user/response/${interviewId}`,  {
            message: transcript
          })
        };
      };
      pc.addTrack(ms.getTracks()[0]!);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("local description set!");

      const sdpResponse = await fetch(`${BACKEND_URL}/api/v1/session/${interviewId}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          "Content-Type": "application/sdp",
        },
      });
      console.log("sdpResponse sent" + "----------" + sdpResponse);

      const answer = {
        type: "answer" as "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    })();
  }, [interviewId]);

  return (
  <>
    <div>
      <audio autoPlay ref={audioRef}></audio>
      Interview
    </div>
  </>
);
}