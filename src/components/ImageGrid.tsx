
import React, { useState } from 'react';
import { DownloadCloud, Expand, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const isMobile = useIsMobile();
  
  const handleOpenLightbox = (image: ImageItem) => {
    setSelectedImage(image);
    // Find the index of the selected image
    const index = images.findIndex(img => img.id === image.id);
    setCurrentIndex(index >= 0 ? index : 0);
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

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedImage(images[currentIndex + 1]);
    }
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedImage(images[currentIndex - 1]);
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
          "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5",
          className
        )}
      >
        {images.map((image) => (
          <motion.div
            key={image.id}
            variants={item}
            className="group image-card relative overflow-hidden"
            onClick={() => handleOpenLightbox(image)}
            style={{ aspectRatio: isMobile ? '1/1' : '4/3' }} // Changed aspect ratio
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

      {/* Lightbox - Mobile Optimized */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseLightbox}>
        <DialogContent className="max-w-full sm:max-w-4xl p-0 overflow-hidden bg-black/90 border-none flex flex-col">
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute right-2 top-2 z-50">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleCloseLightbox} 
                className="text-white bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-full"
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {selectedImage && (
                  <motion.div
                    key={selectedImage.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <img 
                      src={selectedImage.url} 
                      alt={selectedImage.title || 'Gallery image'}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Navigation buttons */}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={goToPrev} 
                disabled={currentIndex === 0}
                className="absolute left-2 h-10 w-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 z-30"
              >
                <ChevronLeft size={24} />
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={goToNext} 
                disabled={currentIndex === images.length - 1}
                className="absolute right-2 h-10 w-10 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 z-30"
              >
                <ChevronRight size={24} />
              </Button>
            </div>
            
            {/* Bottom controls */}
            <div className="p-4 flex justify-between items-center">
              {selectedImage?.title && (
                <div className="text-white text-sm">{selectedImage.title}</div>
              )}
              
              {onDownload && selectedImage && (
                <Button 
                  size="sm"
                  onClick={() => onDownload(selectedImage.id)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                >
                  <DownloadCloud size={16} className="mr-2" />
                  Download
                </Button>
              )}
            </div>
            
            {/* Thumbnail preview on desktop */}
            {!isMobile && images.length > 1 && (
              <div className="hidden sm:flex overflow-x-auto gap-2 p-2 bg-black/40">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "h-16 w-16 flex-shrink-0 cursor-pointer transition-all duration-200 rounded overflow-hidden",
                      currentIndex === idx ? "outline outline-2 outline-primary" : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => {
                      setSelectedImage(img);
                      setCurrentIndex(idx);
                    }}
                  >
                    <img 
                      src={img.url} 
                      alt={img.title || `Thumbnail ${idx}`} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGrid;
