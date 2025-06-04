
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { getAboutImages, updateAboutImage, AboutImage } from '@/services/aboutImageService';

const AboutImageManager: React.FC = () => {
  const [images, setImages] = useState<AboutImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [altText, setAltText] = useState('');

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const data = await getAboutImages();
      setImages(data);
    } catch (error) {
      console.error('Error loading about images:', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setNewImage(files[0]);
    }
  };

  const handleUpdateImage = async (imageId: string) => {
    if (!newImage) {
      toast.error('Please select an image');
      return;
    }

    setIsLoading(true);
    try {
      await updateAboutImage(imageId, newImage, altText);
      toast.success('Image updated successfully');
      setEditingId(null);
      setNewImage(null);
      setAltText('');
      await loadImages();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (image: AboutImage) => {
    setEditingId(image.id);
    setAltText(image.alt_text || '');
    setNewImage(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewImage(null);
    setAltText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-6 h-6" />
        <h2 className="text-2xl font-semibold">About Section Images</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <Card key={image.id} className="relative">
            <CardHeader>
              <CardTitle className="text-lg">Position {image.sort_order}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={image.image_url}
                  alt={image.alt_text || 'About image'}
                  className="w-full h-full object-cover"
                />
              </div>

              {editingId === image.id ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`alt-${image.id}`}>Caption</Label>
                    <Input
                      id={`alt-${image.id}`}
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Enter image caption"
                    />
                  </div>

                  <div>
                    <Label>New Image</Label>
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      multiple={false}
                      autoUpload={true}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateImage(image.id)}
                      disabled={isLoading}
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {image.alt_text || 'No caption'}
                  </p>
                  <Button
                    onClick={() => startEditing(image)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Edit Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AboutImageManager;
