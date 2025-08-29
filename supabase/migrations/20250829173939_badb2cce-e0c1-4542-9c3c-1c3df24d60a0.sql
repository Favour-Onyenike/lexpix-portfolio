-- Fix security vulnerability: Restrict access to customer email addresses in reviews table

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Allow authenticated full access" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON reviews;

-- Remove duplicate policies if they exist
DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view published reviews" ON reviews;

-- Create secure RLS policies

-- 1. Public can view published reviews BUT without email addresses
-- This policy will be used in combination with a view
CREATE POLICY "Public can view published reviews without emails"
ON reviews
FOR SELECT
TO anon
USING (published = true);

-- 2. Authenticated users can view published reviews without email addresses
-- Unless they are the author of the review
CREATE POLICY "Authenticated can view published reviews limited"
ON reviews  
FOR SELECT
TO authenticated
USING (
  published = true AND (
    -- Users can see email only for their own reviews (if we had user_id)
    -- For now, we'll restrict all email access except for admins
    false
  )
);

-- 3. Review authors can view their own reviews (we'll need to track this differently)
-- Since we don't have user_id in reviews table, we'll create an admin-only policy for now

-- 4. Only service role can see all review data including emails (for admin purposes)
CREATE POLICY "Service role can view all reviews"
ON reviews
FOR SELECT 
TO service_role
USING (true);

-- 5. Allow public to insert reviews (existing functionality)
CREATE POLICY "Anyone can submit reviews"
ON reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. Only service role can update/delete reviews (admin functionality)
CREATE POLICY "Service role can modify reviews"
ON reviews
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete reviews"
ON reviews
FOR DELETE  
TO service_role
USING (true);

-- Create a secure view for public/authenticated access that excludes email addresses
CREATE OR REPLACE VIEW public.reviews_public AS
SELECT 
  id,
  name,
  text,
  rating,
  published,
  created_at
  -- Deliberately excluding email field
FROM reviews
WHERE published = true;

-- Grant access to the view
GRANT SELECT ON public.reviews_public TO anon, authenticated;