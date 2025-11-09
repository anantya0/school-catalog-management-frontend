import api from './api'

export const equipmentService = {
  // Get all equipment with filters
  getEquipment: async (params = {}) => {
    const response = await api.get('/equipment', { params })
    return response.data
  },

  // Get equipment by ID
  getEquipmentById: async (id) => {
    const response = await api.get(`/equipment/${id}`)
    return response.data
  },

  // Create new equipment (Admin only)
  createEquipment: async (equipmentData) => {
    const formData = new FormData()
    
    Object.keys(equipmentData).forEach(key => {
      if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
        formData.append(key, equipmentData[key])
      }
    })

    const response = await api.post('/equipment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Update equipment (Admin only)
  updateEquipment: async (id, equipmentData) => {
    const formData = new FormData()
    
    Object.keys(equipmentData).forEach(key => {
      if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
        formData.append(key, equipmentData[key])
      }
    })

    const response = await api.put(`/equipment/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Delete equipment (Admin only)
  deleteEquipment: async (id) => {
    const response = await api.delete(`/equipment/${id}`)
    return response.data
  },

  // Get equipment categories
  getCategories: async () => {
    const response = await api.get('/equipment/categories/list')
    return response.data
  },

  // Create equipment category (Admin only)
  createCategory: async (categoryData) => {
    const response = await api.post('/equipment/categories', categoryData)
    return response.data
  }
}