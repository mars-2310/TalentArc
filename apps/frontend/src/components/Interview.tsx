import { useParams } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef } from "react";
import { BACKEND_URL } from "@/lib/config";

export function Interview(){
  const {interviewId} = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    (async () => {
      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioRef.current = document.createElement("audio");
      audioRef.current.autoplay = true;
      pc.ontrack = (e) => (audioRef.current!.srcObject = e.streams[0]!);

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]!);

      // Set up data channel for sending and receiving events
      //const dc = pc.createDataChannel("oai-events");

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("local description set!");

      const sdpResponse = await fetch(`${BACKEND_URL}/api/v1/session`, {
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

  return 
    <>
      <div>
        <audio autoPlay ref={audioRef}></audio>
        Interview
      </div>
    </>
}