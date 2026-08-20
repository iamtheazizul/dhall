import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';
function ManageSlideshow() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [order, setOrder] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const { getAuthHeader } = useAuth();
  const [link, setLink] = useState('');  

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/slideshow`, {
        headers: getAuthHeader()  // ← ADD THIS
      });
      if (response.ok) {
        const data = await response.json();
        setImages(data.sort((a, b) => a.order - b.order));
        setOrder(data.length + 1);
      }
    } catch (err) {
      console.error('Error fetching slideshow:', err);
      setError('Failed to load slideshow images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !caption.trim()) {
      setError('Please select an image and enter a caption');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);
      formData.append('order', order);
      formData.append('link', link);

      const response = await fetch(`${API_BASE_URL}/slideshow`, {
        method: 'POST',
        headers: getAuthHeader(),  // ← ADD THIS
        body: formData // Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload image');
      }

      setSuccess('Image uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setCaption('');
      setLink('');  
      setPreviewUrl(null);
      document.getElementById('file-input').value = '';
      
      fetchImages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/slideshow?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()  // ← ADD THIS
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update image');

      setSuccess('Image updated successfully!');
      setEditingId(null);
      fetchImages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image? This will also delete the uploaded file.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/slideshow?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()  // ← ADD THIS
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setSuccess('Image deleted successfully!');
      fetchImages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-brand-green mb-6">Manage Slideshow</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Upload Form */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image *
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepts JPG, PNG, GIF, WEBP (max 10MB)
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption *
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Image caption"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                  disabled={uploading}
                />
              </div>

              {/* Link input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                  disabled={uploading}
                />
              </div>
              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
                  disabled={uploading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className={`mt-4 px-6 py-3 rounded-md font-semibold transition ${
                uploading || !selectedFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-green hover:bg-brand-green-dark text-white'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>

        {/* Existing Images */}
        <h2 className="text-2xl font-semibold mb-4">Current Slideshow Images</h2>
        <div className="grid grid-cols-1 gap-6">
          {images.map((image) => (
            <div key={image.id} className="border border-gray-300 rounded-lg p-4 flex gap-4">
              <img
                src={`${API_BASE_URL}${image.url}`}
                alt={image.caption}
                className="w-32 h-32 object-cover rounded-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/128?text=Image+Error';
                }}
              />
              <div className="flex-1">
                {editingId === image.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={image.caption}
                      onChange={(e) => setImages(images.map(img => 
                        img.id === image.id ? { ...img, caption: e.target.value } : img
                      ))}
                      className="w-full p-2 border rounded"
                      placeholder="Caption"
                    />
                    <input
                      type="number"
                      value={image.order}
                      onChange={(e) => setImages(images.map(img => 
                        img.id === image.id ? { ...img, order: parseInt(e.target.value) || 1 } : img
                      ))}
                      className="w-full p-2 border rounded"
                      placeholder="Order"
                    />
                    <input
                      type="text"
                      value={image.link || ''}
                      onChange={(e) => setImages(images.map(img =>
                        img.id === image.id ? { ...img, link: e.target.value } : img
                      ))}
                      className="w-full p-2 border rounded"
                      placeholder="Link URL (optional)"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(image.id, image)}
                        className="bg-brand-green text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          fetchImages();
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-lg">{image.caption}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {image.filename || 'External URL'}
                    </p>
                    <p className="font-semibold text-lg">{image.caption}</p>
                    {image.link && (
                      <p className="text-sm text-blue-500 mt-1">
                        <a href={image.link} target="_blank" rel="noopener noreferrer">{image.link}</a>
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Display Order: {image.order}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setEditingId(image.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <p className="text-center text-gray-500 py-8">No slideshow images yet. Upload one above!</p>
        )}
      </div>
    </div>
  );
}

export default ManageSlideshow;