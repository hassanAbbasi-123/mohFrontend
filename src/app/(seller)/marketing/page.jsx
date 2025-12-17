"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { useGetSellerCouponsQuery, useCreateCouponSellerMutation, useUpdateCouponSellerMutation, useToggleCouponSellerMutation, useDeleteCouponSellerMutation } from '@/store/features/couponApi';

const CouponManagement = () => {
  // State management
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minCartValue: '',
    maxDiscount: '',
    expiryDate: '',
    maxUsage: '',
    isActive: true,
    applicableProducts: [],
    applicableCategories: []
  });

  // API hooks
  const { data: coupons = [], isLoading, refetch } = useGetSellerCouponsQuery();
  const [createCoupon] = useCreateCouponSellerMutation();
  const [updateCoupon] = useUpdateCouponSellerMutation();
  const [toggleCoupon] = useToggleCouponSellerMutation();
  const [deleteCoupon] = useDeleteCouponSellerMutation();

  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Handle dialog open for creating a new coupon
  const handleOpenCreateDialog = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minCartValue: '',
      maxDiscount: '',
      expiryDate: '',
      maxUsage: '',
      isActive: true,
      applicableProducts: [],
      applicableCategories: []
    });
    setOpenDialog(true);
  };

  // Handle dialog open for editing an existing coupon
  const handleOpenEditDialog = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minCartValue: coupon.minCartValue || '',
      maxDiscount: coupon.maxDiscount || '',
      expiryDate: coupon.expiryDate ? formatDateForInput(coupon.expiryDate) : '',
      maxUsage: coupon.maxUsage || '',
      isActive: coupon.isActive,
      applicableProducts: coupon.applicableProducts || [],
      applicableCategories: coupon.applicableCategories || []
    });
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      code: formData.code,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minCartValue: formData.minCartValue ? Number(formData.minCartValue) : 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      expiryDate: formData.expiryDate || null,
      maxUsage: formData.maxUsage ? Number(formData.maxUsage) : null,
      isActive: formData.isActive,
      applicableProducts: formData.applicableProducts || [],
      applicableCategories: formData.applicableCategories || []
    };

    if (editingCoupon) {
      await updateCoupon({ id: editingCoupon._id, data: payload }).unwrap();
      setSnackbar({ open: true, message: 'Coupon updated successfully!', severity: 'success' });
    } else {
      await createCoupon(payload).unwrap();
      setSnackbar({ open: true, message: 'Coupon created successfully!', severity: 'success' });
    }
    handleCloseDialog();
    refetch();
  } catch (error) {
    console.error('Failed to save coupon:', error);
    setSnackbar({ open: true, message: error.data?.message || 'Failed to save coupon', severity: 'error' });
  }
};

 // Handle toggle coupon status
const handleToggleCoupon = async (id) => {
  try {
    await toggleCoupon({ id }).unwrap();   // ✅ pass object with id
    setSnackbar({ open: true, message: 'Coupon status updated!', severity: 'success' });
    refetch();
  } catch (error) {
    console.error('Failed to toggle coupon:', error);
    setSnackbar({ open: true, message: error.data?.message || 'Failed to toggle coupon', severity: 'error' });
  }
};

// Handle delete coupon
const handleDeleteCoupon = async (id) => {
  if (window.confirm('Are you sure you want to delete this coupon?')) {
    try {
      await deleteCoupon({ id }).unwrap();   // ✅ pass object with id
      setSnackbar({ open: true, message: 'Coupon deleted successfully!', severity: 'success' });
      refetch();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      setSnackbar({ open: true, message: error.data?.message || 'Failed to delete coupon', severity: 'error' });
    }
  }
};
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate paginated coupons
  const paginatedCoupons = coupons.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, ml: 4}}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Coupon Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
          sx={{ borderRadius: 2 }}
        >
          Create Coupon
        </Button>
      </Box>

      {isLoading ? (
        <Typography>Loading coupons...</Typography>
      ) : (
        <>
          <TableContainer sx={{ ml: 3}} component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Code</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Discount</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Validity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usage Limit</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCoupons.map((coupon) => (
                  <TableRow key={coupon._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {coupon.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% off`
                          : `$${coupon.discountValue} off`}
                      </Typography>
                      {coupon.minCartValue && (
                        <Typography variant="caption" color="text.secondary">
                          Min. order: ${coupon.minCartValue}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.expiryDate ? formatDateForDisplay(coupon.expiryDate) : 'No expiry'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.maxUsage || 'Unlimited'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={coupon.isActive ? 'Active' : 'Inactive'}
                        color={coupon.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Toggle Status">
                          <IconButton
                            size="small"
                            onClick={() => handleToggleCoupon(coupon._id)}
                            color={coupon.isActive ? 'success' : 'default'}
                          >
                            {coupon.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(coupon)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={coupons.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Create/Edit Coupon Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    name="discountType"
                    value={formData.discountType}
                    label="Discount Type"
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fixed">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  label={formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, max: formData.discountType === 'percentage' ? 100 : undefined }}
                  required
                />
                <TextField
                  fullWidth
                  label="Minimum Order Value"
                  name="minCartValue"
                  type="number"
                  value={formData.minCartValue}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                />
              </Box>
              
              {formData.discountType === 'percentage' && (
                <TextField
                  fullWidth
                  label="Maximum Discount Amount"
                  name="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                />
              )}
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  label="Expiry Date (Optional)"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Usage Limit (Optional)"
                name="maxUsage"
                type="number"
                value={formData.maxUsage}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    name="isActive"
                  />
                }
                label="Active Coupon"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CouponManagement;
