
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PolaroidImageProps {
  src: string;
  alt: string;
  className?: string;
  rotation?: number;
  showCaption?: boolean;
}

const PolaroidImage: React.FC<PolaroidImageProps> = ({ 
  src, 
  alt, 
  className,
  rotation = 0,
  showCaption = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "bg-white p-4 pb-6 shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl",
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white" />
        )}
      </div>
      {showCaption && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600 font-handwriting">{alt}</p>
        </div>
      )}
    </motion.div>
  );
};

export default PolaroidImage;
