import z from "zod";

export const preInterviewBody = z.object({
  LinkedIn: z.$brand.toString(),
  github: z.string()
})