import WebSocket from "ws";
import { prisma } from "./db";

export async function initSideband(callId: string, interviewId: string) {
  const url = "wss://api.openai.com/v1/realtime?call_id=" + callId;
  const ws = new WebSocket(url, {
    headers: {
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
  });

  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
  });

  console.log("interviewId:", interviewId);
  console.log("interview:", interview);

  ws.on("open", function open() {
    console.log("Connected to server.");

    // Send client events over the WebSocket once connected
    ws.send(
      JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: `You are supposed to interview the user based on his/her Computer Science knowledge. Ask 2-3 questions based on theie experience. Use only English as language. Here is everything about user's github which will provide a rough idea of what projects the user have made ${interview?.githubMetaData}`,
        },
      }),
    );
  });

  ws.on("message", async function incoming(message) {
    const parsedMessage = JSON.parse(message.toString());
    if (parsedMessage.type == "response.done") {
      let content: { type: string; transcript: string }[] = [];
      parsedMessage.response.output.map(
        (x) => (content = [...content, ...x.content]),
      );
      const assistantMessage = content
        .filter((x) => x.type === "output_audio")
        .map((x) => x.transcript)
        .join("");
      await prisma.messages.create({
        data: {
          interviewId,
          type: "Assistant",
          message: assistantMessage,
        },
      });
    }
  });
}
