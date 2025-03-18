
import React, { useState } from 'react';
import { DownloadCloud, Expand, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ImageItem {
  id: string;
  url: string;
  title?: string;
}

interface ImageGridProps {
  images: ImageItem[];
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  className?: string;
}

const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onDelete, 
  onDownload,
  className
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  
  const handleOpenLightbox = (image: ImageItem) => {
    setSelectedImage(image);
  };
  
  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handleDownload = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(id);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6",
          className
        )}
      >
        {images.map((image) => (
          <motion.div
            key={image.id}
            variants={item}
            className="group image-card aspect-[3/4] relative overflow-hidden"
            onClick={() => handleOpenLightbox(image)}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            
            <img 
              src={image.url} 
              alt={image.title || 'Gallery image'} 
              className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105" 
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
              {image.title && (
                <h3 className="text-white text-sm font-medium mb-2 drop-shadow-md">{image.title}</h3>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                >
                  <Expand size={14} />
                </Button>
                
                {onDownload && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => handleDownload(e, image.id)}
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                  >
                    <DownloadCloud size={14} />
                  </Button>
                )}
                
                {onDelete && (
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={(e) => handleDelete(e, image.id)}
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 hover:bg-destructive/40"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseLightbox}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative">
            {selectedImage?.url && (
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title || 'Gallery image'}
                className="w-full h-auto rounded-md object-contain max-h-[80vh]"
              />
            )}
            {onDownload && selectedImage && (
              <div className="absolute bottom-4 right-4">
                <Button 
                  size="sm"
                  onClick={() => onDownload(selectedImage.id)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <DownloadCloud size={16} className="mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGrid;
