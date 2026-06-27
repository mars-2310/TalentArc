import z from "zod";

export const preInterviewBody = z.object({
  LinkedIn: z.string(),
  github: z.string()
})