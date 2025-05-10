
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getPublishedReviews, submitReview } from '@/services/localReviewService';
import type { Review } from '@/services/localReviewService';

const ReviewSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await getPublishedReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await submitReview({
        name,
        email,
        rating,
        text: review
      });
      
      if (result) {
        toast.success('Thank you for your review! It has been published.');
        
        // Refresh reviews list to show new review
        loadReviews();
        
        // Reset form
        setName('');
        setEmail('');
        setRating(0);
        setReview('');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-10 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-6 text-center"
        >
          Recent Feedbacks
        </motion.h2>
        <div className="w-16 h-1 bg-yellow-400 mx-auto mb-12"></div>
        
        {/* Reviews Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-black border border-gray-800 p-6 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-5 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-gray-700" />
                    ))}
                  </div>
                </div>
                <div className="h-16 bg-gray-800 rounded w-full animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/4 animate-pulse"></div>
              </motion.div>
            ))
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-black border border-gray-800 p-6 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{review.name}</h3>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 mb-2">{review.text}</p>
                <span className="text-xs text-gray-500">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center p-8 border border-gray-800 rounded-lg">
              <Star className="mx-auto h-10 w-10 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
              <p className="text-gray-400">Be the first to share your experience!</p>
            </div>
          )}
        </div>
        
        {/* Add Review Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Add a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border bg-transparent border-gray-700 rounded-md p-4 h-14 text-white focus:border-yellow-400 focus:ring-0 w-full"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border bg-transparent border-gray-700 rounded-md p-4 h-14 text-white focus:border-yellow-400 focus:ring-0 w-full"
                    required
                  />
                </div>
                <div>
                  <div className="flex space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            (hoveredRating ? star <= hoveredRating : star <= rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-500"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Textarea
                    placeholder="Write Your Review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="border bg-transparent border-gray-700 rounded-md p-4 min-h-[150px] text-white focus:border-yellow-400 focus:ring-0 w-full"
                    required
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
