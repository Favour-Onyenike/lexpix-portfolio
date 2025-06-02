import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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

    if (error) {
      console.error('Error fetching published reviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching published reviews:', error);
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

    if (error) {
      console.error('Error fetching all reviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching all reviews:', error);
    return [];
  }
};

// Submit a new review - now automatically published
export const submitReview = async (reviewData: {
  name: string;
  email: string;
  rating: number;
  text: string;
}): Promise<Review | null> => {
  try {
    const newReview = {
      ...reviewData,
      created_at: new Date().toISOString(),
      published: true, // Automatically published
    };
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting review:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception submitting review:', error);
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
    
    if (error) {
      console.error('Error updating review status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception updating review status:', error);
    return false;
  }
};

// Delete a review from database
export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting review:', id);
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting review from database:', error);
      throw error;
    }
    
    console.log('Review deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};
