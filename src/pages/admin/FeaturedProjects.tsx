
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
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
import { GripVertical, Pencil, Trash2, ImagePlus, MoveUp, MoveDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  FeaturedProject, 
  getFeaturedProjects, 
  createFeaturedProject, 
  updateFeaturedProject, 
  deleteFeaturedProject,
  reorderFeaturedProjects
} from '@/services/projectService';
import { uploadImage } from '@/services/galleryService';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<FeaturedProject> | null>(null);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getFeaturedProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddNew = () => {
    setCurrentProject({
      title: '',
      description: '',
      image_url: '',
      link: '/',
      sort_order: projects.length
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (project: FeaturedProject) => {
    setCurrentProject({ ...project });
    setIsDialogOpen(true);
  };

  const handleImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setTempImageFile(files[0]);
      // Show a preview in the form
      const previewUrl = URL.createObjectURL(files[0]);
      setCurrentProject(prev => prev ? { ...prev, image_url: previewUrl } : null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async () => {
    if (!currentProject || !currentProject.title || !currentProject.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      let finalImageUrl = currentProject.image_url;

      // If a new image was uploaded, process it first
      if (tempImageFile) {
        const uploadedImageUrl = await uploadImage(tempImageFile, 'featured_projects');
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        } else {
          toast.error('Failed to upload image');
          setIsLoading(false);
          return;
        }
      }

      // Make sure we have an image URL
      if (!finalImageUrl) {
        toast.error('Please upload an image');
        setIsLoading(false);
        return;
      }

      const projectData = {
        ...currentProject,
        image_url: finalImageUrl
      };

      let result;
      if (currentProject.id) {
        // Update existing project
        result = await updateFeaturedProject(currentProject.id, projectData);
        if (result) {
          toast.success('Project updated successfully');
        }
      } else {
        // Create new project
        result = await createFeaturedProject(projectData as Omit<FeaturedProject, 'id'>);
        if (result) {
          toast.success('Project created successfully');
        }
      }

      if (result) {
        // Refresh the list
        loadProjects();
        // Close the dialog
        setIsDialogOpen(false);
        // Reset form state
        setCurrentProject(null);
        setTempImageFile(null);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      setIsLoading(true);
      try {
        const success = await deleteFeaturedProject(deleteId);
        if (success) {
          toast.success('Project deleted successfully');
          loadProjects();
        } else {
          toast.error('Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      } finally {
        setIsLoading(false);
        setDeleteId(null);
      }
    }
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === projects.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[newIndex];
    newProjects[newIndex] = temp;

    // Update UI immediately
    setProjects(newProjects);

    // Save to database
    try {
      const projectIds = newProjects.map(p => p.id);
      await reorderFeaturedProjects(projectIds);
    } catch (error) {
      console.error('Error reordering projects:', error);
      toast.error('Failed to save order');
      // Revert UI change on error
      loadProjects();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Featured Projects</h1>
            <p className="text-muted-foreground">Manage the featured projects that appear on your homepage</p>
          </div>
          
          <Button onClick={handleAddNew} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Plus size={16} className="mr-2" />
            Add New Project
          </Button>
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="h-12 bg-muted rounded mb-4"></div>
                <div className="h-24 bg-muted rounded"></div>
              </Card>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project, index) => (
              <Card key={project.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-1 h-full flex items-center justify-center p-4 bg-muted">
                      <GripVertical className="text-muted-foreground" />
                    </div>
                    
                    <div className="col-span-2 h-24 bg-gray-100">
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="col-span-6 p-4">
                      <h3 className="text-lg font-medium">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      <p className="text-xs text-blue-500 mt-2">{project.link}</p>
                    </div>
                    
                    <div className="col-span-3 flex gap-2 justify-end p-4">
                      <Button 
                        variant="outline" 
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveProject(index, 'up')}
                      >
                        <MoveUp size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        disabled={index === projects.length - 1}
                        onClick={() => moveProject(index, 'down')}
                      >
                        <MoveDown size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        size="icon"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 size={16} />
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
              <ImagePlus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Your featured projects will appear on the homepage
            </p>
            <Button onClick={handleAddNew}>Add Your First Project</Button>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentProject?.id ? "Edit Project" : "Create New Project"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={currentProject?.title || ""}
                onChange={handleInputChange}
                placeholder="Project title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentProject?.description || ""}
                onChange={handleInputChange}
                placeholder="Project description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link">Link URL</Label>
              <Input
                id="link"
                name="link"
                value={currentProject?.link || "/"}
                onChange={handleInputChange}
                placeholder="/gallery or /events"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Project Image</Label>
              {currentProject?.image_url ? (
                <div className="relative aspect-video mb-2 bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={currentProject.image_url}
                    alt="Project preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => setCurrentProject(prev => prev ? { ...prev, image_url: '' } : null)}
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
                setCurrentProject(null);
                setTempImageFile(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {isLoading ? "Saving..." : "Save Project"}
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
              This will permanently delete this featured project.
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

export default FeaturedProjects;
