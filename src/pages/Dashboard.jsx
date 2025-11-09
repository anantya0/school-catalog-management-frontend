import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button
} from '@mui/material'
import {
  Devices,
  Assignment,
  History,
  Warning,
  CheckCircle,
  Schedule
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { borrowingService } from '../services/borrowingService'
import { equipmentService } from '../services/equipmentService'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Dashboard = () => {
  const { user, isAdmin, isStaff } = useAuth()
  const navigate = useNavigate()

  // Fetch active borrowings
  const { data: activeBorrowings, isLoading: loadingBorrowings } = useQuery({
    queryKey: ['activeBorrowings'],
    queryFn: borrowingService.getActiveBorrowings
  })

  // Fetch pending requests for staff/admin
  const { data: pendingRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => borrowingService.getAllRequests({ status: 'pending', limit: 5 }),
    enabled: isStaff
  })

  // Fetch equipment stats for admin
  const { data: equipmentStats, isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipmentStats'],
    queryFn: () => equipmentService.getEquipment({ limit: 1 }),
    enabled: isAdmin
  })

  if (loadingBorrowings) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  const borrowings = activeBorrowings?.borrowings || []
  const overdueBorrowings = borrowings.filter(b => b.is_overdue)
  const dueSoonBorrowings = borrowings.filter(b => b.days_until_due <= 2 && !b.is_overdue)

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user.firstName}!
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Devices color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Borrowings
                  </Typography>
                  <Typography variant="h4">
                    {borrowings.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Overdue Items
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {overdueBorrowings.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Due Soon
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {dueSoonBorrowings.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {isStaff && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assignment color="secondary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Requests
                    </Typography>
                    <Typography variant="h4" color="secondary.main">
                      {pendingRequests?.requests?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Active Borrowings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                My Active Borrowings
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/my-borrowings')}
              >
                View All
              </Button>
            </Box>
            
            {borrowings.length === 0 ? (
              <Typography color="textSecondary" align="center" py={4}>
                No active borrowings
              </Typography>
            ) : (
              <List>
                {borrowings.slice(0, 5).map((borrowing) => (
                  <ListItem key={borrowing.id} divider>
                    <ListItemIcon>
                      {borrowing.is_overdue ? (
                        <Warning color="error" />
                      ) : borrowing.days_until_due <= 2 ? (
                        <Schedule color="warning" />
                      ) : (
                        <CheckCircle color="success" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={borrowing.equipment_name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Due: {new Date(borrowing.due_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Location: {borrowing.location}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box>
                      {borrowing.is_overdue ? (
                        <Chip label="Overdue" color="error" size="small" />
                      ) : borrowing.days_until_due <= 2 ? (
                        <Chip label="Due Soon" color="warning" size="small" />
                      ) : (
                        <Chip 
                          label={`${borrowing.days_until_due} days left`} 
                          color="success" 
                          size="small" 
                        />
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Pending Requests (Staff/Admin only) */}
        {isStaff && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Pending Requests
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/borrowing-requests')}
                >
                  View All
                </Button>
              </Box>
              
              {!pendingRequests?.requests?.length ? (
                <Typography color="textSecondary" align="center" py={4}>
                  No pending requests
                </Typography>
              ) : (
                <List>
                  {pendingRequests.requests.slice(0, 5).map((request) => (
                    <ListItem key={request.id} divider>
                      <ListItemText
                        primary={request.equipment_name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Requested by: {request.requester_first_name} {request.requester_last_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Date: {new Date(request.requested_start_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip label="Pending" color="warning" size="small" />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<Devices />}
                  onClick={() => navigate('/equipment')}
                >
                  Browse Equipment
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<History />}
                  onClick={() => navigate('/my-borrowings')}
                >
                  My Borrowings
                </Button>
              </Grid>
              {isStaff && (
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    onClick={() => navigate('/borrowing-requests')}
                  >
                    Manage Requests
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard