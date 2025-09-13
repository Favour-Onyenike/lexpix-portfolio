-- Create counters table for admin-controlled statistics
CREATE TABLE public.counters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  value integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;

-- Create policies for counter access
CREATE POLICY "Public can view counters" 
ON public.counters 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage counters" 
ON public.counters 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Insert default counter values
INSERT INTO public.counters (name, value, label, sort_order) VALUES
('satisfied_clients', 25, 'Satisfied Clients', 1),
('projects_completed', 20, 'Projects Completed', 2),
('years_experience', 3, 'Years Experience', 3),
('photos_delivered', 200, 'Photos Delivered', 4);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_counters_updated_at
BEFORE UPDATE ON public.counters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();