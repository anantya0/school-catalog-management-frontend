import { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Box, Alert
} from '@mui/material';
import { borrowingService } from '../services/borrowingService';

const BorrowingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await borrowingService.getAllRequests();
      setRequests(response.requests || []);
    } catch (err) {
      setError('Failed to load borrowing requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, status, rejectionReason = '') => {
    try {
      await borrowingService.updateRequestStatus(requestId, { status, rejectionReason });
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Borrowing Requests Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Requester</TableCell>
              <TableCell>Equipment</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No borrowing requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {request.requester_first_name} {request.requester_last_name}
                    <br />
                    <small>({request.requester_username})</small>
                  </TableCell>
                  <TableCell>{request.equipment_name}</TableCell>
                  <TableCell>
                    {new Date(request.request_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.requested_start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(request.requested_end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{request.purpose || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):');
                            handleStatusUpdate(request.id, 'rejected', reason);
                          }}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default BorrowingRequests;