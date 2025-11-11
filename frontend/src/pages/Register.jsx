import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Stack, TextField, Typography, Alert } from '@mui/material'
import AsyncButton from '../components/AsyncButton.jsx'
import api from '../utils/api.js'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
})

export default function Register() {
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm({ resolver: zodResolver(schema) })
  const [done, setDone] = React.useState(false)

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', { name: data.name, email: data.email, password: data.password })
      setDone(true)
      reset()
    } catch (e) {
      const msg = e?.response?.data?.error || 'Registration failed'
      setError('root', { message: msg })
    }
  }

  if (done) {
    return (
      <Stack spacing={2} maxWidth={420}>
        <Typography variant="h5">Check your email</Typography>
        <Typography variant="body1">We sent you a verification link. Once verified, an admin will approve your account.</Typography>
      </Stack>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} maxWidth={420}>
        <Typography variant="h5">Worker Registration</Typography>
        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
        <TextField label="Full name" {...register('name')} error={!!errors.name} helperText={errors.name?.message} />
        <TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
        <TextField label="Confirm Password" type="password" {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
        <AsyncButton type="submit" variant="contained">Create Account</AsyncButton>
      </Stack>
    </form>
  )
}

