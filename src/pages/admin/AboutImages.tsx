
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AboutImageManager from '@/components/admin/AboutImageManager';

const AboutImages = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">About Section Images</h1>
          <p className="text-muted-foreground">
            Manage the polaroid-style images displayed in the about section
          </p>
        </div>
        
        <AboutImageManager />
      </div>
    </AdminLayout>
  );
};

export default AboutImages;
