import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Stack, Typography, Alert } from '@mui/material'
import AsyncButton from '../components/AsyncButton.jsx'
import { useAuthStore } from '../store/auth.js'
import { useNavigate, useLocation } from 'react-router-dom'

const schema = z.object({
  email: z.string().trim().min(3).refine(v => v.includes('@'), { message: 'Invalid email' }),
  password: z.string().min(6)
})

export default function Login() {
  const { register, handleSubmit, formState: { errors }, setError } = useForm({ resolver: zodResolver(schema) })
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('verify')
    if (token) {
      // Attempt email verification silently
      fetch((import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(() => {}).catch(() => {})
    }
  }, [location.search])

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    if (!result?.ok) {
      const reason = result?.reason || 'Invalid credentials'
      if (reason === 'Account pending approval' || reason === 'Email not verified') {
        navigate('/pending', { state: { reason } })
        return
      }
      setError('root', { message: reason })
    } else {
      const role = useAuthStore.getState().user?.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'manager') navigate('/review')
      else navigate('/')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} maxWidth={400}>
        <Typography variant="h5">Login</Typography>
        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
        <TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
        <TextField label="Password" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(onSubmit)() } }} />
        <AsyncButton type="submit" variant="contained" onClick={handleSubmit(onSubmit)}>Login</AsyncButton>
      </Stack>
    </form>
  )
}
