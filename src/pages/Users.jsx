import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { userService } from '../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
      } else {
        await userService.createUser(formData);
      }
      fetchUsers();
      handleClose();
    } catch (err) {
      setError('Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      password: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', first_name: '', last_name: '', role: 'student', password: '' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'warning';
      default: return 'primary';
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users || []).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            margin="normal"
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;