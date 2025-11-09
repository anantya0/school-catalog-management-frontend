import { useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Paper,
  Avatar
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Info,
  Warning,
  Error,
  CheckCircle,
  Delete,
  MarkEmailRead
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../services/userService'

const Notifications = () => {
  const queryClient = useQueryClient()

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications()
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />
      case 'warning': return <Warning color="warning" />
      case 'error': return <Error color="error" />
      default: return <Info color="info" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'info'
    }
  }

  if (isLoading) return <Typography>Loading notifications...</Typography>

  const notifications = notificationsData?.notifications || []
  const unreadCount = notificationsData?.unreadCount || 0

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          🔔 Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkEmailRead />}
            onClick={() => markAllAsReadMutation.mutate()}
          >
            Mark All Read ({unreadCount})
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No notifications yet
          </Typography>
          <Typography color="textSecondary">
            You'll see updates about your equipment requests here
          </Typography>
        </Paper>
      ) : (
        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                mb: 1,
                bgcolor: notification.is_read ? 'background.paper' : 'action.hover',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider'
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.light` }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                    {!notification.is_read && (
                      <Chip label="New" color="primary" size="small" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
              <Box>
                {!notification.is_read && (
                  <IconButton
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    size="small"
                  >
                    <MarkEmailRead />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}

export default Notifications