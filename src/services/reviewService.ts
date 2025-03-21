
import { supabase } from '@/lib/supabase';

export type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  text: string;
  created_at: string;
  published: boolean;
};

// Get all published reviews
export const getPublishedReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Get all reviews for admin
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

// Submit a new review
export const submitReview = async (reviewData: {
  name: string;
  email: string;
  rating: number;
  text: string;
}): Promise<Review | null> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...reviewData,
        published: false, // Reviews need admin approval
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    return null;
  }
};

// Update review published status
export const updateReviewStatus = async (id: string, published: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ published })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating review status:', error);
    return false;
  }
};

// Delete a review
export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};
