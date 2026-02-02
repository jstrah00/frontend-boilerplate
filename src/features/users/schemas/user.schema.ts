import { z } from "zod"

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required").max(100, "First name is too long"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  role: z.enum(["admin", "user"], {
    required_error: "Role is required",
  }),
})

export const userUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name is too long").optional(),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name is too long").optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
