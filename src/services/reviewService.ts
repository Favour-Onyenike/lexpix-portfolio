
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
    const result = await supabase
      .from('reviews')
      .select()
      .eq('published', true);
    
    // Sort manually after getting the data
    const data = result.data || [];
    const sortedData = [...data].sort((a, b) => {
      if (a.created_at < b.created_at) return 1; // Descending order
      if (a.created_at > b.created_at) return -1;
      return 0;
    });
    
    if (result.error) throw result.error;
    return sortedData;
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
      .select();
    
    if (error) throw error;
    
    // Sort manually after getting the data
    const sortedData = [...(data || [])].sort((a, b) => {
      if (a.created_at < b.created_at) return 1; // Descending order
      if (a.created_at > b.created_at) return -1;
      return 0;
    });
    
    return sortedData;
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
