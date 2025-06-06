
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ImageUploader';
import { aboutImageService, AboutImage } from '@/services/aboutImageService';
import { toast } from 'sonner';

const AdminAboutImages = () => {
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    image_url: '',
    alt_text: '',
    sort_order: 1
  });

  const queryClient = useQueryClient();

  const { data: aboutImages = [], isLoading } = useQuery({
    queryKey: ['admin-about-images'],
    queryFn: aboutImageService.getAboutImages
  });

  const createMutation = useMutation({
    mutationFn: aboutImageService.createAboutImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-images'] });
      setIsCreating(false);
      resetForm();
      toast.success('About image created successfully');
    },
    onError: () => {
      toast.error('Failed to create about image');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      aboutImageService.updateAboutImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-images'] });
      setEditingImage(null);
      resetForm();
      toast.success('About image updated successfully');
    },
    onError: () => {
      toast.error('Failed to update about image');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: aboutImageService.deleteAboutImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-images'] });
      toast.success('About image deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete about image');
    }
  });

  const resetForm = () => {
    setFormData({
      image_url: '',
      alt_text: '',
      sort_order: 1
    });
    setUploadedFiles([]);
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetForm();
    setFormData(prev => ({ ...prev, sort_order: aboutImages.length + 1 }));
  };

  const handleEdit = (image: AboutImage) => {
    setEditingImage(image.id);
    setFormData({
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      sort_order: image.sort_order
    });
  };

  const handleImageUpload = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      // For demo purposes, we'll use a placeholder URL
      const placeholderUrl = URL.createObjectURL(files[0]);
      setFormData(prev => ({ ...prev, image_url: placeholderUrl }));
      toast.info('Image selected. In a real app, this would be uploaded to storage.');
    }
  };

  const handleSave = () => {
    if (!formData.image_url) {
      toast.error('Please provide an image URL or upload an image');
      return;
    }

    const imageData = {
      image_url: formData.image_url,
      alt_text: formData.alt_text,
      sort_order: formData.sort_order
    };

    if (isCreating) {
      createMutation.mutate(imageData);
    } else if (editingImage) {
      updateMutation.mutate({ id: editingImage, updates: imageData });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingImage(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this about image?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">About Section Images</h1>
            <p className="text-gray-600 mt-2">Manage the Polaroid-style images displayed in the about section (maximum 3 images recommended)</p>
          </div>
          <Button onClick={handleCreate} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>

        {(isCreating || editingImage) && (
          <Card>
            <CardHeader>
              <CardTitle>{isCreating ? 'Add New About Image' : 'Edit About Image'}</CardTitle>
              <CardDescription>
                Upload or provide URL for an image to display in the about section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>Or Upload Image</Label>
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  multiple={false}
                  autoUpload={true}
                  acceptedFiles={uploadedFiles}
                />
              </div>
              
              <div>
                <Label htmlFor="alt_text">Alt Text / Caption</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  placeholder="Description of the image"
                />
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aboutImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <img 
                      src={image.image_url} 
                      alt={image.alt_text || 'About image'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Sort Order: {image.sort_order}</p>
                    <p className="text-sm text-gray-600">{image.alt_text || 'No caption'}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(image)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(image.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {aboutImages.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-gray-600">No about images yet. Add your first one!</p>
          </div>
        )}

        {aboutImages.length > 3 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Note:</strong> You have more than 3 images. Only the first 3 (by sort order) will be displayed on the website.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAboutImages;
