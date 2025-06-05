
import React from 'react';
import { motion } from 'framer-motion';

interface PolaroidImageProps {
  src: string;
  alt: string;
  rotation?: number;
  index?: number;
}

const PolaroidImage: React.FC<PolaroidImageProps> = ({ 
  src, 
  alt, 
  rotation = 0,
  index = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 80
      }}
      viewport={{ once: true }}
      className="relative group cursor-pointer"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="bg-white p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-0">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={src}
            alt={alt}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600 font-handwriting italic">
            {alt}
          </p>
        </div>
      </div>
      
      {/* Tape effect */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100 opacity-70 rounded-sm shadow-sm border border-yellow-200"></div>
    </motion.div>
  );
};

export default PolaroidImage;
