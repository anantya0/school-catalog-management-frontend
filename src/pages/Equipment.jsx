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
  Dialog
} from '@mui/material'
import { Search, Add, Devices } from '@mui/icons-material'
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
    })
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
        <Box textAlign="center" py={8}>
          <Devices sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No equipment found
          </Typography>
          <Typography color="textSecondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {equipment.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image_url || '/placeholder-equipment.jpg'}
                    alt={item.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box display="flex" gap={1} mb={1}>
                      <Chip
                        label={item.availability_status}
                        color={getStatusColor(item.availability_status)}
                        size="small"
                      />
                      <Chip
                        label={item.condition_status}
                        color={getConditionColor(item.condition_status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    {item.category_name && (
                      <Typography variant="body2" color="textSecondary">
                        Category: {item.category_name}
                      </Typography>
                    )}
                    {item.location && (
                      <Typography variant="body2" color="textSecondary">
                        Location: {item.location}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/equipment/${item.id}`)}
                    >
                      View Details
                    </Button>
                    {item.availability_status === 'available' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/equipment/${item.id}?action=borrow`)}
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