import { supabase } from '@/integrations/supabase/client';

const STORAGE_LIMIT_BYTES = 600 * 1024 * 1024; // 600MB in bytes

export interface StorageFile {
  name: string;
  size: number;
  bucket_id: string;
  created_at: string;
  mimetype: string;
}

export const getCurrentStorageUsage = async (): Promise<{ totalSize: number; files: StorageFile[] }> => {
  try {
    const allFiles: StorageFile[] = [];
    
    // Get files from images bucket - need to list files in subdirectories
    const { data: imagesFolders, error: imagesError } = await supabase.storage
      .from('images')
      .list();
    
    if (imagesError) {
      console.error('Error listing images folders:', imagesError);
    } else if (imagesFolders) {
      // For each folder in images bucket, list the files inside
      for (const folder of imagesFolders) {
        if (folder.name && folder.name !== '.emptyFolderPlaceholder') {
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from('images')
            .list(folder.name);
          
          if (folderError) {
            console.error(`Error listing files in ${folder.name}:`, folderError);
          } else if (folderFiles) {
            for (const file of folderFiles) {
              if (file.metadata?.size && file.name !== '.emptyFolderPlaceholder') {
                allFiles.push({
                  name: `${folder.name}/${file.name}`,
                  size: file.metadata.size,
                  bucket_id: 'images',
                  created_at: file.created_at || '',
                  mimetype: file.metadata.mimetype || 'unknown'
                });
              }
            }
          }
        }
      }
    }
    
    // Get files from featured-projects bucket
    const { data: projectFiles, error: projectsError } = await supabase.storage
      .from('featured-projects')
      .list();
    
    if (projectsError) {
      console.error('Error listing featured-projects:', projectsError);
    } else if (projectFiles) {
      for (const file of projectFiles) {
        if (file.metadata?.size && file.name !== '.emptyFolderPlaceholder') {
          allFiles.push({
            name: file.name,
            size: file.metadata.size,
            bucket_id: 'featured-projects',
            created_at: file.created_at || '',
            mimetype: file.metadata.mimetype || 'unknown'
          });
        }
      }
    }
    
    const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);
    return { totalSize, files: allFiles };
  } catch (error) {
    console.error('Error getting storage usage:', error);
    return { totalSize: 0, files: [] };
  }
};

export const checkStorageLimit = async (additionalSize: number = 0): Promise<{ canUpload: boolean; currentUsage: number; limit: number; percentUsed: number }> => {
  const { totalSize } = await getCurrentStorageUsage();
  const newTotalSize = totalSize + additionalSize;
  const percentUsed = (newTotalSize / STORAGE_LIMIT_BYTES) * 100;
  
  return {
    canUpload: newTotalSize <= STORAGE_LIMIT_BYTES,
    currentUsage: totalSize,
    limit: STORAGE_LIMIT_BYTES,
    percentUsed
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileSizes = (files: File[]): number => {
  return files.reduce((total, file) => total + file.size, 0);
};

export const getLargeFiles = async (sizeThresholdMB: number = 10): Promise<StorageFile[]> => {
  const { files } = await getCurrentStorageUsage();
  const thresholdBytes = sizeThresholdMB * 1024 * 1024;
  return files.filter(file => file.size > thresholdBytes);
};

export const deleteLargeFiles = async (sizeThresholdMB: number = 10): Promise<{ deletedCount: number; failedFiles: string[] }> => {
  try {
    const largeFiles = await getLargeFiles(sizeThresholdMB);
    console.log(`Found ${largeFiles.length} files larger than ${sizeThresholdMB}MB`);
    
    let deletedCount = 0;
    const failedFiles: string[] = [];
    
    for (const file of largeFiles) {
      try {
        const { error } = await supabase.storage
          .from(file.bucket_id)
          .remove([file.name]);
        
        if (error) {
          console.error(`Failed to delete ${file.name}:`, error);
          failedFiles.push(file.name);
        } else {
          console.log(`Deleted large file: ${file.name} (${formatBytes(file.size)})`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting ${file.name}:`, error);
        failedFiles.push(file.name);
      }
    }
    
    return { deletedCount, failedFiles };
  } catch (error) {
    console.error('Error deleting large files:', error);
    return { deletedCount: 0, failedFiles: [] };
  }
};