
import React from 'react';
import { motion } from 'framer-motion';

interface PolaroidImageProps {
  src: string;
  alt: string;
  rotation?: number;
  delay?: number;
}

const PolaroidImage: React.FC<PolaroidImageProps> = ({ 
  src, 
  alt, 
  rotation = 0, 
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white p-2 shadow-lg transform hover:scale-105 transition-transform duration-300 w-32 h-40"
      style={{ 
        transform: `rotate(${rotation}deg)`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="w-full h-28 overflow-hidden bg-gray-100">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600 font-handwriting">{alt}</p>
      </div>
    </motion.div>
  );
};

export default PolaroidImage;
