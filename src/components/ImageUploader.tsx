
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  multiple = true,
  className 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name} is not an image file`);
      }
    }
    
    return validFiles;
  };

  const processFiles = (files: FileList) => {
    const validFiles = validateFiles(files);
    
    if (validFiles.length === 0) return;
    
    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    
    onImageUpload(selectedFiles);
    
    // Clear previews and files after upload
    previews.forEach(URL.revokeObjectURL);
    setSelectedFiles([]);
    setPreviews([]);
    toast.success('Images uploaded successfully');
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors text-center",
          dragActive ? "border-primary/80 bg-primary/5" : "border-border",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center py-4 gap-2">
          <div className="rounded-full bg-secondary p-3">
            <Upload size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mt-2">Drag images here</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Upload JPG, PNG or GIF files
          </p>
          <Button 
            type="button" 
            onClick={handleButtonClick} 
            variant="secondary"
          >
            Select Images
          </Button>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Selected images ({previews.length})</h4>
            <Button onClick={handleUpload} size="sm">
              <Check size={16} className="mr-2" />
              Upload All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group rounded-md overflow-hidden aspect-square bg-secondary">
                <img 
                  src={src} 
                  alt={`Preview ${index}`} 
                  className="object-cover w-full h-full" 
                />
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-2 right-2 rounded-full bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
