
import { v4 as uuidv4 } from 'uuid';

export type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  text: string;
  created_at: string;
  published: boolean;
};

const LOCAL_STORAGE_KEY = 'lexpix_reviews';

// Helper to get all reviews from localStorage
const getStoredReviews = (): Review[] => {
  try {
    const storedReviews = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedReviews ? JSON.parse(storedReviews) : [];
  } catch (error) {
    console.error('Error fetching reviews from localStorage:', error);
    return [];
  }
};

// Helper to save reviews to localStorage
const saveReviews = (reviews: Review[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving reviews to localStorage:', error);
  }
};

// Get all published reviews
export const getPublishedReviews = async (): Promise<Review[]> => {
  try {
    const reviews = getStoredReviews();
    return reviews.filter(review => review.published).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching published reviews:', error);
    return [];
  }
};

// Get all reviews for admin
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const reviews = getStoredReviews();
    return reviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching all reviews:', error);
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
    const reviews = getStoredReviews();
    
    const newReview: Review = {
      id: uuidv4(),
      ...reviewData,
      created_at: new Date().toISOString(),
      published: true, // Now automatically published
    };
    
    reviews.push(newReview);
    saveReviews(reviews);
    
    return newReview;
  } catch (error) {
    console.error('Error submitting review:', error);
    return null;
  }
};

// Update review published status
export const updateReviewStatus = async (id: string, published: boolean): Promise<boolean> => {
  try {
    const reviews = getStoredReviews();
    
    const updatedReviews = reviews.map(review => 
      review.id === id ? { ...review, published } : review
    );
    
    saveReviews(updatedReviews);
    return true;
  } catch (error) {
    console.error('Error updating review status:', error);
    return false;
  }
};

// Delete a review
export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    const reviews = getStoredReviews();
    
    const filteredReviews = reviews.filter(review => review.id !== id);
    
    if (filteredReviews.length === reviews.length) {
      return false; // No review was deleted
    }
    
    saveReviews(filteredReviews);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
};

// Add some sample reviews for demonstration if none exist
export const initializeReviews = (): void => {
  const reviews = getStoredReviews();
  
  if (reviews.length === 0) {
    const sampleReviews: Review[] = [
      {
        id: uuidv4(),
        name: "John Smith",
        email: "john@example.com",
        rating: 5,
        text: "Absolutely amazing photography! Lucas captured our wedding beautifully.",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        published: true
      },
      {
        id: uuidv4(),
        name: "Sarah Johnson",
        email: "sarah@example.com",
        rating: 4,
        text: "Great work on our family portraits. Everyone loved them!",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        published: true
      },
      {
        id: uuidv4(),
        name: "Michael Williams",
        email: "michael@example.com",
        rating: 5,
        text: "Professional service and stunning results. Highly recommended!",
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
        published: true
      }
    ];
    
    saveReviews(sampleReviews);
  }
};
