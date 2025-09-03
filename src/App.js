import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Rating,
  Box,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import './App.css';

// API base URL - Update this to your deployed backend URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Login Component
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Store Ratings App
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Login to access your dashboard
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openStoreDialog, setOpenStoreDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [owners, setOwners] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, usersRes, storesRes, ownersRes] = await Promise.all([
        axios.get('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/admin/stores', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/admin/users?role=OWNER', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
      setOwners(ownersRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/signup', userData, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
      setSnackbar({ open: true, message: 'User created successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error creating user', severity: 'error' });
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/admin/users/${userId}`, userData, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error updating user', severity: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        loadData();
        setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: err.response?.data?.error || 'Error deleting user', severity: 'error' });
      }
    }
  };

  const handleCreateStore = async (storeData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/stores', storeData, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
      setSnackbar({ open: true, message: 'Store created successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error creating store', severity: 'error' });
    }
  };

  const handleUpdateStore = async (storeId, storeData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/admin/stores/${storeId}`, storeData, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
      setSnackbar({ open: true, message: 'Store updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error updating store', severity: 'error' });
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store? All ratings will be deleted too.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/admin/stores/${storeId}`, { headers: { Authorization: `Bearer ${token}` } });
        loadData();
        setSnackbar({ open: true, message: 'Store deleted successfully!', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: err.response?.data?.error || 'Error deleting store', severity: 'error' });
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => setActiveTab('dashboard')}>
            <DashboardIcon sx={{ mr: 1 }} />
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => setActiveTab('users')}>
            <PeopleIcon sx={{ mr: 1 }} />
            Users
          </Button>
          <Button color="inherit" onClick={() => setActiveTab('stores')}>
            <StoreIcon sx={{ mr: 1 }} />
            Stores
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {activeTab === 'dashboard' && stats && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Stores
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalStores}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Ratings
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRatings}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Users by Role
                  </Typography>
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <Chip key={role} label={`${role}: ${count}`} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Rated Stores
                  </Typography>
                  <Grid container spacing={2}>
                    {stats.topStores.map((store) => (
                      <Grid item xs={12} md={4} key={store.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6">{store.name}</Typography>
                            <Typography color="textSecondary">Owner: {store.owner}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Rating value={store.averageRating} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({store.totalRatings} ratings)
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 'users' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Users Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingUser(null);
                  setOpenUserDialog(true);
                }}
              >
                Add User
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Ratings</TableCell>
                    <TableCell>Stores</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'ADMIN' ? 'error' : user.role === 'OWNER' ? 'warning' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>{user._count.ratings}</TableCell>
                      <TableCell>{user._count.stores}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setEditingUser(user);
                            setOpenUserDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user._count.stores > 0 || user._count.ratings > 0}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 'stores' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Stores Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingStore(null);
                  setOpenStoreDialog(true);
                }}
              >
                Add Store
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Avg Rating</TableCell>
                    <TableCell>Total Ratings</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>{store.owner.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={store.averageRating} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {store.averageRating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{store.totalRatings}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setEditingStore(store);
                            setOpenStoreDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteStore(store.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>

      {/* User Dialog */}
      <UserDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        user={editingUser}
      />

      {/* Store Dialog */}
      <StoreDialog
        open={openStoreDialog}
        onClose={() => setOpenStoreDialog(false)}
        onSubmit={editingStore ? handleUpdateStore : handleCreateStore}
        store={editingStore}
        owners={owners}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// User Dialog Component
function UserDialog({ open, onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER'
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      onSubmit(user.id, formData);
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Name (20-60 characters)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            helperText={`${formData.name.length}/60 characters`}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          {!user && (
            <TextField
              fullWidth
              label="Password (8-16 chars, uppercase + special char)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="OWNER">OWNER</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Store Dialog Component
function StoreDialog({ open, onClose, onSubmit, store, owners }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    ownerId: ''
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        address: store.address,
        ownerId: store.ownerId
      });
    } else {
      setFormData({
        name: '',
        address: '',
        ownerId: ''
      });
    }
  }, [store]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (store) {
      onSubmit(store.id, formData);
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{store ? 'Edit Store' : 'Create Store'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Name (20-60 characters)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            helperText={`${formData.name.length}/60 characters`}
          />
          <TextField
            fullWidth
            label="Address (up to 400 characters)"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            margin="normal"
            required
            multiline
            rows={3}
            helperText={`${formData.address.length}/400 characters`}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Owner</InputLabel>
            <Select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              label="Owner"
              required
            >
              {owners.map((owner) => (
                <MenuItem key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {store ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// User Dashboard
function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await axios.get(`/stores?search=${searchTerm}`);
      setStores(response.data);
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  };

  const rateStore = async (storeId, rating) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/stores/${storeId}/rate`, { rating }, { headers: { Authorization: `Bearer ${token}` } });
      loadStores();
    } catch (err) {
      alert(err.response?.data?.error || 'Error rating store');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Store Ratings
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Search stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400 }}
        />
        <Button
          variant="contained"
          onClick={loadStores}
          sx={{ ml: 2 }}
        >
          Search
        </Button>
      </Box>

      <Grid container spacing={3}>
        {stores.map(store => (
          <Grid item xs={12} md={6} lg={4} key={store.id}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {store.name}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {store.address}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={store.averageRating} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({store.totalRatings} ratings)
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Owner: {store.owner.name}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Rate this store:
                  </Typography>
                  <Rating
                    value={0}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        rateStore(store.id, newValue);
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// Owner Dashboard
function OwnerDashboard() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/owner/stores', { headers: { Authorization: `Bearer ${token}` } });
      setStores(response.data);
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Stores
      </Typography>
      
      <Grid container spacing={3}>
        {stores.map(store => (
          <Grid item xs={12} md={6} key={store.id}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {store.name}
                </Typography>
                <Typography color="textSecondary" paragraph>
                  {store.address}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={store.averageRating} readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {store.averageRating} ({store.totalRatings} ratings)
                  </Typography>
                </Box>
                
                {store.ratings.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Ratings:
                    </Typography>
                    {store.ratings.slice(0, 5).map(rating => (
                      <Box key={rating.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {rating.user.name}
                        </Typography>
                        <Rating value={rating.rating} readOnly size="small" />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Store Ratings App
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user.name} ({user.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {user.role === 'ADMIN' && <AdminDashboard />}
      {user.role === 'USER' && <UserDashboard />}
      {user.role === 'OWNER' && <OwnerDashboard />}
    </Box>
  );
}

export default App;
