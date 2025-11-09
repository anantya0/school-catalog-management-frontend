import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Grid, Chip, Button, Box,
  Card, CardMedia, CardContent, Divider, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { ArrowBack, Build } from '@mui/icons-material';
import { equipmentService } from '../services/equipmentService';
import { borrowingService } from '../services/borrowingService';

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowDialog, setBorrowDialog] = useState(false);
  const [borrowData, setBorrowData] = useState({
    requestedStartDate: '',
    requestedEndDate: '',
    purpose: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await equipmentService.getEquipmentById(id);
        setEquipment(response.equipment || response);
      } catch (err) {
        console.error('Equipment detail error:', err);
        console.error('Error response:', err.response);
        if (err.response?.status === 401) {
          setError('Please log in to view equipment details');
        } else {
          setError(`Failed to load equipment details: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEquipment();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'borrowed': return 'warning';
      case 'maintenance': return 'info';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      case 'damaged': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!equipment) return <Alert severity="error">Equipment not found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/equipment')}
        sx={{ mb: 2 }}
      >
        Back to Equipment
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            {equipment.image_url ? (
              <CardMedia
                component="img"
                height="400"
                image={`http://localhost:5000${equipment.image_url}`}
                alt={equipment.name}
                sx={{ objectFit: 'contain' }}
              />
            ) : (
              <Box
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100'
                }}
              >
                <Build sx={{ fontSize: 100, color: 'grey.400' }} />
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {equipment.name}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Chip
                label={equipment.availability_status}
                color={getStatusColor(equipment.availability_status)}
                sx={{ mr: 1 }}
              />
              <Chip
                label={equipment.condition_status}
                color={getConditionColor(equipment.condition_status)}
              />
            </Box>

            <Typography variant="body1" paragraph>
              {equipment.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Brand
                </Typography>
                <Typography variant="body1">
                  {equipment.brand || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Model
                </Typography>
                <Typography variant="body1">
                  {equipment.model || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Serial Number
                </Typography>
                <Typography variant="body1">
                  {equipment.serial_number || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {equipment.location || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {equipment.category_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Max Borrowing Days
                </Typography>
                <Typography variant="body1">
                  {equipment.max_borrowing_days} days
                </Typography>
              </Grid>
            </Grid>

            {equipment.availability_status === 'available' && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => {
                  const today = new Date();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const weekLater = new Date(today);
                  weekLater.setDate(weekLater.getDate() + 7);
                  
                  setBorrowData({
                    requestedStartDate: tomorrow.toISOString().split('T')[0],
                    requestedEndDate: weekLater.toISOString().split('T')[0],
                    purpose: ''
                  });
                  setBorrowDialog(true);
                }}
              >
                Request to Borrow
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={borrowDialog} onClose={() => setBorrowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request to Borrow: {equipment.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={borrowData.requestedStartDate}
                onChange={(e) => setBorrowData({...borrowData, requestedStartDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={borrowData.requestedEndDate}
                onChange={(e) => setBorrowData({...borrowData, requestedEndDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose (Optional)"
                multiline
                rows={3}
                value={borrowData.purpose}
                onChange={(e) => setBorrowData({...borrowData, purpose: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBorrowDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await borrowingService.createRequest({
                  equipmentId: equipment.id,
                  ...borrowData
                });
                setBorrowDialog(false);
                alert('Borrowing request submitted successfully!');
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to submit request');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EquipmentDetail;