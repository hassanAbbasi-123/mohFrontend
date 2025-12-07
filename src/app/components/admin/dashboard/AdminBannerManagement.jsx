'use client'

import { useState } from 'react';
import {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
} from '@/store/features/bannerApi';

export default function AdminBannerManagement() {
  const { data: banners, isLoading, refetch } = useGetAllBannersQuery();
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [toggleBannerStatus] = useToggleBannerStatusMutation();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta: '',
    bgColor: '',
    overlay: '',
    textColor: '',
    status: false,
    image: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('cta', formData.cta);
    data.append('bgColor', formData.bgColor);
    data.append('overlay', formData.overlay);
    data.append('textColor', formData.textColor);
    data.append('status', formData.status);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingId) {
        await updateBanner({ id: editingId, formData: data });
      } else {
        await createBanner(data);
      }
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      cta: banner.cta,
      bgColor: banner.bgColor,
      overlay: banner.overlay,
      textColor: banner.textColor,
      status: banner.status,
      image: null,
    });
    setPreviewImage(banner.image);
    setEditingId(banner._id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBanner(id);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleBannerStatus(id);
      refetch();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      cta: '',
      bgColor: '',
      overlay: '',
      textColor: '',
      status: false,
      image: null,
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Banner Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Title"
          className="block mb-2"
          required
        />
        <input
          type="text"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleInputChange}
          placeholder="Subtitle"
          className="block mb-2"
          required
        />
        <input
          type="text"
          name="cta"
          value={formData.cta}
          onChange={handleInputChange}
          placeholder="CTA"
          className="block mb-2"
          required
        />
        <input
          type="text"
          name="bgColor"
          value={formData.bgColor}
          onChange={handleInputChange}
          placeholder="Background Color (e.g., from-pink-500 to-purple-600)"
          className="block mb-2"
          required
        />
        <input
          type="text"
          name="overlay"
          value={formData.overlay}
          onChange={handleInputChange}
          placeholder="Overlay (e.g., bg-gradient-to-r)"
          className="block mb-2"
          required
        />
        <input
          type="text"
          name="textColor"
          value={formData.textColor}
          onChange={handleInputChange}
          placeholder="Text Color (e.g., text-white)"
          className="block mb-2"
          required
        />
        <label>
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleInputChange}
          />
          Active
        </label>
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          className="block mb-2"
          accept="image/*"
          required={!editingId}
        />
        {previewImage && <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover mb-2" />}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="ml-2 bg-gray-500 text-white px-4 py-2">
            Cancel
          </button>
        )}
      </form>

      {/* List */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Image</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner._id}>
              <td>{banner.title}</td>
              <td>{banner.subtitle}</td>
              <td><img src={banner.image} alt={banner.title} className="w-16 h-16 object-cover" /></td>
              <td>{banner.status ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => handleEdit(banner)} className="bg-yellow-500 text-white px-2 py-1 mr-2">
                  Edit
                </button>
                <button onClick={() => handleDelete(banner._id)} className="bg-red-500 text-white px-2 py-1 mr-2">
                  Delete
                </button>
                <button onClick={() => handleToggle(banner._id)} className="bg-green-500 text-white px-2 py-1">
                  Toggle Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}