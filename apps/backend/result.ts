import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const outputSchema = z.object({
  feedback: z.string().describe("Overall feedback about the candidate's interview performance."),
  score: z.number().int().min(0).max(10).describe("Overall interview score out of 10."),
});

const RESULT_PROMPT = `
You are an expert technical interviewer.

Evaluate the interview transcript below.

Consider:
- Technical correctness
- Communication skills
- Problem-solving ability
- Clarity of explanations
- Confidence
- Completeness of answers

Provide:
1. A score from 0 to 10.
2. Constructive feedback explaining the strengths and areas for improvement.

Interview Transcript:

{{USER_TRANSCRIPT}}

Return ONLY valid JSON.

Format:

{
  "feedback": string,
  "score": number
}
`;

export async function calculateResult(
  messages: {
    type: "Assistant" | "User";
    message: string;
    createdAt: Date;
  }[]
) {
  const transcript = messages
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((m) => `${m.type}: ${m.message}`)
    .join("\n");

  const completion = await client.responses.parse({
    model: "gpt-5-nano",
    input: RESULT_PROMPT.replace(
      "{{USER_TRANSCRIPT}}",
      transcript
    ),
    text: {
      format: {
        type: "json_schema",
        name: "interview_result",
        strict: true,
        schema: {
          type: "object",
          properties: {
            feedback: {
              type: "string",
            },
            score: {
              type: "integer",
              minimum: 0,
              maximum: 10,
            },
          },
          required: ["feedback", "score"],
          additionalProperties: false,
        },
      },
    },
  });

  const result = completion.output_parsed;

  return outputSchema.parse(result);
}