import { z } from 'zod'

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters long'),
})

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(50, 'Name must be less than 50 characters long'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z
        .string()
        .min(1, 'Confirm Password is required')
        .min(6, 'Confirm Password must be at least 6 characters long')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
