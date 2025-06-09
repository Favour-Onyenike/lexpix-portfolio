
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getFeaturedProject } from '@/services/projectService';
import { 
  getFeaturedProjectImages, 
  addFeaturedProjectImage, 
  deleteFeaturedProjectImage,
  reorderFeaturedProjectImages,
  FeaturedProjectImage 
} from '@/services/featuredProjectImageService';
import { uploadImage } from '@/services/galleryService';

const ProjectGallery = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [images, setImages] = useState<FeaturedProjectImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadProject = async () => {
    if (!projectId) return;
    
    try {
      const project = await getFeaturedProject(projectId);
      if (project) {
        setProjectTitle(project.title);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project details');
    }
  };

  const loadImages = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const data = await getFeaturedProjectImages(projectId);
      setImages(data);
    } catch (error) {
      console.error('Error loading project images:', error);
      toast.error('Failed to load project images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadImages();
    }
  }, [projectId]);

  const handleAddNew = () => {
    setNewImageTitle('');
    setTempImageFile(null);
    setTempImageUrl('');
    setIsDialogOpen(true);
  };

  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setTempImageFile(files[0]);
      const previewUrl = URL.createObjectURL(files[0]);
      setTempImageUrl(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!projectId || !newImageTitle || !tempImageFile) {
      toast.error('Please provide a title and select an image');
      return;
    }

    setIsLoading(true);

    try {
      // Upload the image first
      const uploadedImageUrl = await uploadImage(tempImageFile, `featured_projects/${projectId}`);
      if (!uploadedImageUrl) {
        toast.error('Failed to upload image');
        setIsLoading(false);
        return;
      }

      // Add the image to the project
      const result = await addFeaturedProjectImage(projectId, newImageTitle, uploadedImageUrl);
      if (result) {
        toast.success('Image added successfully');
        loadImages();
        setIsDialogOpen(false);
        setNewImageTitle('');
        setTempImageFile(null);
        setTempImageUrl('');
      } else {
        toast.error('Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('Failed to add image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      setIsLoading(true);
      try {
        const success = await deleteFeaturedProjectImage(deleteId);
        if (success) {
          toast.success('Image deleted successfully');
          loadImages();
        } else {
          toast.error('Failed to delete image');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      } finally {
        setIsLoading(false);
        setDeleteId(null);
      }
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[newIndex];
    newImages[newIndex] = temp;

    // Update UI immediately
    setImages(newImages);

    // Save to database
    try {
      const imageIds = newImages.map(img => img.id);
      await reorderFeaturedProjectImages(imageIds);
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Failed to save order');
      // Revert UI change on error
      loadImages();
    }
  };

  if (!projectId) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Invalid Project</h1>
          <Button onClick={() => navigate('/admin/featured-projects')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Featured Projects
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/featured-projects')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className="text-3xl font-semibold">{projectTitle} Gallery</h1>
            <p className="text-muted-foreground">Manage images for this featured project</p>
          </div>
          
          <div className="ml-auto">
            <Button onClick={handleAddNew} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              <Plus size={16} className="mr-2" />
              Add Image
            </Button>
          </div>
        </div>

        {isLoading && images.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src={image.url} 
                      alt={image.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{image.title}</h3>
                    <div className="flex gap-2 justify-between items-center">
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon"
                          disabled={index === 0}
                          onClick={() => moveImage(index, 'up')}
                        >
                          <MoveUp size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          disabled={index === images.length - 1}
                          onClick={() => moveImage(index, 'down')}
                        >
                          <MoveDown size={14} />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        size="icon"
                        onClick={() => setDeleteId(image.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-muted/30 rounded-lg border border-dashed">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              Add images to create a gallery for this featured project
            </p>
            <Button onClick={handleAddNew}>Add Your First Image</Button>
          </div>
        )}
      </div>

      {/* Add Image Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Image Title</Label>
              <Input
                id="title"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Enter image title"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Image</Label>
              {tempImageUrl ? (
                <div className="relative aspect-video mb-2 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={tempImageUrl}
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => {
                      setTempImageFile(null);
                      setTempImageUrl('');
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  multiple={false}
                />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewImageTitle('');
                setTempImageFile(null);
                setTempImageUrl('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !newImageTitle || !tempImageFile}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {isLoading ? "Adding..." : "Add Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this image from the project gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ProjectGallery;
