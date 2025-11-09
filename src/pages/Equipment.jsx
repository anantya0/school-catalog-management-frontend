import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Pagination,
  InputAdornment,
  Fab,
  Dialog,
  Avatar,
  Paper
} from '@mui/material'
import { Search, Add, Devices, Computer, Build, Science, SportsEsports, Camera, Print, Headset } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { equipmentService } from '../services/equipmentService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EquipmentForm from '../components/Equipment/EquipmentForm'

const Equipment = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const limit = 12

  // Fetch equipment
  const { data: equipmentData, isLoading } = useQuery({
    queryKey: ['equipment', page, search, category, status],
    queryFn: () => equipmentService.getEquipment({
      page,
      limit,
      search: search || undefined,
      category: category || undefined,
      status: status || undefined
    }),
    keepPreviousData: true
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: equipmentService.getCategories
  })

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setPage(1)
  }

  const handleCategoryChange = (event) => {
    setCategory(event.target.value)
    setPage(1)
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value)
    setPage(1)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'borrowed':
        return 'warning'
      case 'maintenance':
        return 'error'
      case 'retired':
        return 'default'
      default:
        return 'default'
    }
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent':
        return 'success'
      case 'good':
        return 'info'
      case 'fair':
        return 'warning'
      case 'poor':
      case 'damaged':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryIcon = (categoryName) => {
    const category = categoryName?.toLowerCase() || ''
    if (category.includes('computer') || category.includes('laptop')) return <Computer />
    if (category.includes('camera') || category.includes('photo')) return <Camera />
    if (category.includes('printer')) return <Print />
    if (category.includes('audio') || category.includes('headset')) return <Headset />
    if (category.includes('game') || category.includes('gaming')) return <SportsEsports />
    if (category.includes('science') || category.includes('lab')) return <Science />
    return <Build />
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading equipment..." />
  }

  const equipment = equipmentData?.equipment || []
  const pagination = equipmentData?.pagination || {}
  const categories = categoriesData?.categories || []

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Equipment Catalog
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
          >
            Add Equipment
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search equipment..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            select
            label="Category"
            value={category}
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            select
            label="Status"
            value={status}
            onChange={handleStatusChange}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="borrowed">Borrowed</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="retired">Retired</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Equipment Grid */}
      {equipment.length === 0 ? (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 8, bgcolor: 'grey.50' }}>
          <Devices sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" color="textPrimary" gutterBottom>
            No equipment found
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Try adjusting your search criteria or browse all categories
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {equipment.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {item.image_url ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`http://localhost:5000${item.image_url}`}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <Box
                    sx={{
                      height: 200,
                      display: item.image_url ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'white'
                    }}
                  >
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.dark' }}>
                      {getCategoryIcon(item.category_name)}
                    </Avatar>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.5em'
                      }}
                    >
                      {item.description || 'No description available'}
                    </Typography>
                    {item.borrow_count > 0 && (
                      <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
                        🔥 Popular ({item.borrow_count} borrows)
                      </Typography>
                    )}
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip
                        label={item.availability_status}
                        color={getStatusColor(item.availability_status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={item.condition_status}
                        color={getConditionColor(item.condition_status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    {item.category_name && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        📂 {item.category_name}
                      </Typography>
                    )}
                    {item.location && (
                      <Typography variant="body2" color="textSecondary">
                        📍 {item.location}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/equipment/${item.id}`)}
                      sx={{ mr: 1 }}
                    >
                      View Details
                    </Button>
                    {item.availability_status === 'available' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/equipment/${item.id}?action=borrow`)}
                        sx={{ ml: 'auto' }}
                      >
                        Borrow
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Add Equipment Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <EquipmentForm
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            setOpenForm(false)
            // Refetch equipment data
          }}
        />
      </Dialog>
    </Box>
  )
}

export default Equipment