import { z } from "zod"

export const eventFormSchema = z.object({
    title: z.string().min(3,"Title must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters").max(400, 'Description must be less than 400 characters'),
    location: z.string().min(3,"Location must be at least 3 characters").max(400, 'Location must be less than 400 characters'),
    imgUrl: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    categoryId: z.string(),
    price: z.string(),
    isFree: z.boolean(),
    url: z.string().url(),
    tickets: z
    .object({
      total: z.preprocess((val) => Number(val), z.number().min(1, "At least 1 ticket must be available")),
    })
    .optional(), // Tickets are optional for free events
}).refine(
  (data) => data.isFree || (data.tickets && data.tickets.total > 0),
  {
    message: "Tickets are required for non-free events",
    path: ["tickets"],
  }
);