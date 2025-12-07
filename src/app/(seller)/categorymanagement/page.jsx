"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Chip,
  IconButton,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useGetAllCategoriesQuery, useCreateCategoryMutation, useUpdateOwnCategoryMutation, useDeleteOwnCategoryMutation } from '@/store/features/categoryApi';

const CategoryManagement = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [userId, setUserId] = useState('');

  // API hooks
  const { data: categoriesData, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateOwnCategoryMutation();
  const [deleteCategory] = useDeleteOwnCategoryMutation();

  // Effects
  useEffect(() => {
    // Safely get user ID from localStorage
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user._id || '');
      }
    } catch (err) {
      console.error("Error parsing user data from localStorage:", err);
      setSnackbar({
        open: true,
        message: 'Error loading user information',
        severity: 'error'
      });
    }
  }, []);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching categories',
        severity: 'error'
      });
    }
  }, [error]);

  // Handlers
  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parentCategory: category.parentCategory?._id || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parentCategory: ''
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentCategory: ''
    });
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...formData
        }).unwrap();
        
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      } else {
        await createCategory(formData).unwrap();
        
        setSnackbar({
          open: true,
          message: 'Category proposed successfully. Waiting for admin approval.',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error('Error saving category:', error);
      
      let errorMessage = 'Error saving category';
      if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteCategory(categoryId).unwrap();
      
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
      
      let errorMessage = 'Error deleting category';
      if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Helper functions
  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentCategory);
  };

  const getStatusChip = (category) => {
    return category.isActive ? (
      <Chip label="Active" color="success" size="small" />
    ) : (
      <Chip label="Pending Approval" color="warning" size="small" />
    );
  };

  // Filter categories by the logged-in user
  const sellerCategories = categories.filter(cat => cat.createdBy === userId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Category Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {sellerCategories.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography textAlign="center" color="textSecondary">
                  You haven't created any categories yet.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          sellerCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h2">
                      {category.name}
                    </Typography>
                    {getStatusChip(category)}
                  </Box>
                  
                  {category.description && (
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {category.description}
                    </Typography>
                  )}
                  
                  {category.parentCategory && (
                    <Typography variant="body2" paragraph>
                      Parent: {category.parentCategory.name}
                    </Typography>
                  )}
                  
                  <Typography variant="caption" display="block" gutterBottom>
                    Created: {new Date(category.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      disabled={category.isActive} // Can't edit if approved
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(category._id)}
                      disabled={category.isActive} // Can't delete if approved
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              disabled={isCreating || isUpdating}
            />
            
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              disabled={isCreating || isUpdating}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Parent Category (Optional)</InputLabel>
              <Select
                name="parentCategory"
                value={formData.parentCategory}
                label="Parent Category (Optional)"
                onChange={handleInputChange}
                disabled={isCreating || isUpdating}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {getParentCategories().map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {editingCategory && !editingCategory.isActive && (
              <Alert severity="info" sx={{ mt: 2 }}>
                This category is pending admin approval. You can still edit it until it's approved.
              </Alert>
            )}
            
            {editingCategory && editingCategory.isActive && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This category has been approved. You can no longer edit or delete it.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isCreating || isUpdating}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isCreating || isUpdating || (editingCategory && editingCategory.isActive)}
            >
              {(isCreating || isUpdating) ? (
                <CircularProgress size={24} />
              ) : editingCategory ? (
                'Update Category'
              ) : (
                'Propose Category'
              )}
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

export default CategoryManagement;