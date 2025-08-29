-- Fix about images with invalid blob URLs
UPDATE about_images 
SET image_url = '/lovable-uploads/d985036e-35d7-4585-8804-fb606abcea49.png'
WHERE sort_order = 2 AND image_url LIKE 'blob:%';

UPDATE about_images 
SET image_url = '/lovable-uploads/9a5b8dd9-88d8-4ed4-bacf-07c70e1bdffe.png'
WHERE sort_order = 3 AND image_url LIKE 'blob:%';