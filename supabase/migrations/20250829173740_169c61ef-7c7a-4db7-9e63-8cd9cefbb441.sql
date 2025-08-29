-- Enable RLS on tables that don't have it enabled
ALTER TABLE featured_project_images ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for featured_project_images
CREATE POLICY "Allow authenticated users full access to project images" 
ON featured_project_images 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public read access to project images" 
ON featured_project_images 
FOR SELECT 
USING (true);