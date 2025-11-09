import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Divider
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../contexts/AuthContext'

const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required')
})

const registerSchema = yup.object({
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  role: yup.string().oneOf(['student', 'staff']).required('Role is required'),
  studentId: yup.string().when('role', {
    is: 'student',
    then: (schema) => schema.required('Student ID is required for students')
  }),
  staffId: yup.string().when('role', {
    is: 'staff',
    then: (schema) => schema.required('Staff ID is required for staff')
  }),
  department: yup.string(),
  phone: yup.string()
})

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(isLogin ? loginSchema : registerSchema)
  })

  const watchRole = watch('role')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(data)
      } else {
        await register(data)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    reset()
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center' }}>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={8} sx={{ padding: 4, width: '100%', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Box textAlign="center" mb={3}>
              <Typography component="h1" variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                🏢 School Equipment
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Lending System
              </Typography>
            </Box>
            <Typography component="h2" variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              {isLogin ? '🔑 Sign In' : '📝 Sign Up'}
            </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoComplete="username"
              autoFocus
              {...registerField('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            {!isLogin && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  {...registerField('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="First Name"
                    {...registerField('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Last Name"
                    {...registerField('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                </Box>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  select
                  label="Role"
                  SelectProps={{ native: true }}
                  {...registerField('role')}
                  error={!!errors.role}
                  helperText={errors.role?.message}
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </TextField>
                {watchRole === 'student' && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Student ID"
                    {...registerField('studentId')}
                    error={!!errors.studentId}
                    helperText={errors.studentId?.message}
                  />
                )}
                {watchRole === 'staff' && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Staff ID"
                    {...registerField('staffId')}
                    error={!!errors.staffId}
                    helperText={errors.staffId?.message}
                  />
                )}
                <TextField
                  margin="normal"
                  fullWidth
                  label="Department"
                  {...registerField('department')}
                  error={!!errors.department}
                  helperText={errors.department?.message}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone"
                  {...registerField('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              {...registerField('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
              disabled={loading}
            >
              {loading ? '⏳ Please wait...' : (isLogin ? '🔑 Sign In' : '📝 Sign Up')}
            </Button>

            <Divider sx={{ my: 2 }} />

            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={toggleMode}
                type="button"
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Link>
            </Box>
          </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}

export default Login