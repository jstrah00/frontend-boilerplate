import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  remember_me: z.boolean().optional().default(false),
})

export type LoginFormData = z.infer<typeof loginSchema>
