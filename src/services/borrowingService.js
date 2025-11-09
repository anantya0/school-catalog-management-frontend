import api from './api'

export const borrowingService = {
  // Create borrowing request
  createRequest: async (requestData) => {
    const response = await api.post('/borrowing/request', requestData)
    return response.data
  },

  // Get user's borrowing requests
  getMyRequests: async (params = {}) => {
    const response = await api.get('/borrowing/requests', { params })
    return response.data
  },

  // Get all borrowing requests (Staff/Admin only)
  getAllRequests: async (params = {}) => {
    const response = await api.get('/borrowing/requests/all', { params })
    return response.data
  },

  // Approve/Reject borrowing request (Staff/Admin only)
  updateRequestStatus: async (requestId, statusData) => {
    const response = await api.put(`/borrowing/requests/${requestId}/status`, statusData)
    return response.data
  },

  // Get user's active borrowings
  getActiveBorrowings: async () => {
    const response = await api.get('/borrowing/active')
    return response.data
  },

  // Return equipment
  returnEquipment: async (transactionId, returnData) => {
    const response = await api.put(`/borrowing/return/${transactionId}`, returnData)
    return response.data
  },

  // Get borrowing history
  getBorrowingHistory: async (params = {}) => {
    const response = await api.get('/borrowing/history', { params })
    return response.data
  }
}