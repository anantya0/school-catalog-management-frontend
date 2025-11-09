import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        setConnected(true)
        // Join user-specific room
        newSocket.emit('join_user_room', user.id)
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setConnected(false)
      })

      // Listen for real-time notifications
      newSocket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev])
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          })
        }
      })

      newSocket.on('new_borrowing_request', (data) => {
        setNotifications(prev => [{
          title: 'New Borrowing Request',
          message: `${data.requesterName} requested ${data.equipmentName}`,
          type: 'info'
        }, ...prev])
      })

      newSocket.on('request_status_update', (data) => {
        const message = data.status === 'approved' 
          ? `Your request for ${data.equipmentName} has been approved`
          : `Your request for ${data.equipmentName} has been rejected${data.rejectionReason ? ': ' + data.rejectionReason : ''}`
        
        setNotifications(prev => [{
          title: 'Request Status Update',
          message,
          type: data.status === 'approved' ? 'success' : 'error'
        }, ...prev])
      })

      newSocket.on('return_notification', (data) => {
        let message = `Equipment ${data.equipmentName} returned`
        if (data.lateFee > 0) {
          message += ` with late fee: $${data.lateFee}`
        }
        if (data.condition === 'damaged') {
          message += ' (damaged condition reported)'
        }

        setNotifications(prev => [{
          title: 'Equipment Returned',
          message,
          type: data.lateFee > 0 || data.condition === 'damaged' ? 'warning' : 'success'
        }, ...prev])
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
        setNotifications([])
      }
    }
  }, [isAuthenticated, user])

  // Request notification permission
  useEffect(() => {
    if (isAuthenticated && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [isAuthenticated])

  const clearNotifications = () => {
    setNotifications([])
  }

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }

  const value = {
    socket,
    connected,
    notifications,
    clearNotifications,
    removeNotification
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}