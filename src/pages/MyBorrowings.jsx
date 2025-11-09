import { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Box, Alert
} from '@mui/material';
import { borrowingService } from '../services/borrowingService';

const MyBorrowings = () => {
  const [requests, setRequests] = useState([]);
  const [activeBorrowings, setActiveBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, activeRes] = await Promise.all([
          borrowingService.getMyRequests(),
          borrowingService.getActiveBorrowings()
        ]);
        setRequests(requestsRes.requests || []);
        setActiveBorrowings(activeRes.borrowings || []);
      } catch (err) {
        setError('Failed to load borrowing data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Borrowings
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Borrowing Requests
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Requested Date</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Purpose</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No borrowing requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
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
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.purpose || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Active Borrowings
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Borrowed Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeBorrowings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No active borrowings found
                  </TableCell>
                </TableRow>
              ) : (
                activeBorrowings.map((borrowing) => (
                  <TableRow key={borrowing.id}>
                    <TableCell>{borrowing.equipment_name}</TableCell>
                    <TableCell>
                      {new Date(borrowing.borrowed_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(borrowing.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{borrowing.condition_on_borrow}</TableCell>
                    <TableCell>
                      <Chip
                        label={borrowing.is_overdue ? 'Overdue' : 'Active'}
                        color={borrowing.is_overdue ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default MyBorrowings;