import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Download, FileText, Image } from 'lucide-react';

interface StorageFile {
  name: string;
  size: number;
  bucket_id: string;
  created_at: string;
  mimetype: string;
}

export default function StorageManager() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadStorageFiles = async () => {
    try {
      setLoading(true);
      
      const { getCurrentStorageUsage } = await import('@/services/storageService');
      const { totalSize, files } = await getCurrentStorageUsage();
      
      console.log('Loaded files:', files);
      setFiles(files);
      setTotalSize(totalSize);
    } catch (error) {
      console.error('Error loading storage files:', error);
      toast.error('Failed to load storage data');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileName: string, bucketId: string) => {
    try {
      setDeleting(fileName);
      
      const { error } = await supabase.storage
        .from(bucketId)
        .remove([fileName]);
      
      if (error) throw error;
      
      // Remove from gallery_images if it's a gallery file
      if (bucketId === 'images') {
        const fileUrl = `${supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl}`;
        await supabase
          .from('gallery_images')
          .delete()
          .eq('url', fileUrl);
      }
      
      toast.success('File deleted successfully');
      loadStorageFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const bulkDeleteLargeFiles = async () => {
    try {
      setBulkDeleting(true);
      
      const { deleteLargeImagesFromGallery } = await import('@/services/galleryService');
      const result = await deleteLargeImagesFromGallery(10);
      
      if (result.errors.length > 0) {
        console.error('Some files failed to delete:', result.errors);
        toast.error(`Deleted ${result.storageDeleted} files, but ${result.errors.length} failed`);
      } else {
        toast.success(`Successfully deleted ${result.storageDeleted} large files and cleaned up ${result.databaseDeleted} database records`);
      }
      
      loadStorageFiles();
    } catch (error) {
      console.error('Error during bulk delete:', error);
      toast.error('Failed to delete large files');
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = () => {
    const limitBytes = 1024 * 1024 * 1024; // 1GB
    return (totalSize / limitBytes) * 100;
  };

  useEffect(() => {
    loadStorageFiles();
  }, []);

  const largeFiles = files.filter(f => f.size > 10 * 1024 * 1024).sort((a, b) => b.size - a.size);
  const galleryFiles = files.filter(f => f.bucket_id === 'images').sort((a, b) => b.size - a.size);
  const projectFiles = files.filter(f => f.bucket_id === 'featured-projects').sort((a, b) => b.size - a.size);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">Loading storage data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Storage Manager</h1>
          <p className="text-muted-foreground">Manage your storage usage and optimize file sizes</p>
        </div>

        {/* Storage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Used: {formatBytes(totalSize)}</span>
              <Badge variant={getUsagePercentage() > 100 ? "destructive" : "secondary"}>
                {getUsagePercentage().toFixed(1)}% of 1GB
              </Badge>
            </div>
            <Progress value={Math.min(getUsagePercentage(), 100)} />
            {getUsagePercentage() > 100 && (
              <p className="text-sm text-destructive">
                You're over the 1GB limit by {formatBytes(totalSize - (1024 * 1024 * 1024))}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="large-files">
          <TabsList>
            <TabsTrigger value="large-files">Large Files ({largeFiles.length})</TabsTrigger>
            <TabsTrigger value="gallery">Gallery ({galleryFiles.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projectFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="large-files" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Files Over 10MB</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      These are your largest files. Consider compressing or removing them.
                    </p>
                  </div>
                  {largeFiles.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={bulkDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All Large Files
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete All Files Over 10MB</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3">
                            <p>Are you sure you want to delete all {largeFiles.length} files larger than 10MB?</p>
                            <p className="font-medium text-green-600">
                              This will free up {formatBytes(largeFiles.reduce((acc, f) => acc + f.size, 0))} of storage space.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              This action will remove files from both storage and database records. This cannot be undone.
                            </p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={bulkDeleteLargeFiles}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete All Large Files
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {largeFiles.map((file) => {
                    const imageUrl = `${supabase.storage.from(file.bucket_id).getPublicUrl(file.name).data.publicUrl}`;
                    
                    return (
                      <div key={file.name} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          {/* Image Preview */}
                          <div className="flex-shrink-0">
                            <img 
                              src={imageUrl} 
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded-lg border"
                              onError={(e) => {
                                const img = e.currentTarget;
                                const fallback = img.nextElementSibling as HTMLElement;
                                img.style.display = 'none';
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center hidden">
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          
                          {/* File Info */}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="font-semibold text-red-600">{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>{file.bucket_id}</span>
                              <span>•</span>
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={deleting === file.name}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Large File</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-3">
                                <div className="text-center">
                                  <img 
                                    src={imageUrl} 
                                    alt={file.name}
                                    className="w-32 h-32 object-cover rounded-lg border mx-auto"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <p>Are you sure you want to delete "{file.name}"?</p>
                                <p className="font-medium text-green-600">This will free up {formatBytes(file.size)} of storage space.</p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteFile(file.name, file.bucket_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete File
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                  {largeFiles.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No files over 10MB found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gallery Images</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total: {formatBytes(galleryFiles.reduce((acc, f) => acc + f.size, 0))}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {galleryFiles.slice(0, 20).map((file) => (
                    <div key={file.name} className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Gallery Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the image and free up {formatBytes(file.size)}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFile(file.name, file.bucket_id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                  {galleryFiles.length > 20 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Showing 20 of {galleryFiles.length} files
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Images</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total: {formatBytes(projectFiles.reduce((acc, f) => acc + f.size, 0))}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projectFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the image and free up {formatBytes(file.size)}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFile(file.name, file.bucket_id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}