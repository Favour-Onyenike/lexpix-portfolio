
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

// This component will be updated to use Supabase after connecting
const ReviewSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // Mock reviews data - will be replaced with Supabase data
  const mockReviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Incredible experience working with LexPix! The photos captured the essence of our event perfectly.',
      date: '2023-10-15'
    },
    {
      id: 2,
      name: 'Michael Chen',
      rating: 4,
      text: 'Professional service and amazing results. Our wedding photos turned out better than we could have imagined.',
      date: '2023-09-22'
    },
    {
      id: 3,
      name: 'Amanda Rodriguez',
      rating: 5,
      text: 'Lucas has an incredible eye for detail. The portraits he took of our family are treasures we\'ll keep forever.',
      date: '2023-11-05'
    },
    {
      id: 4,
      name: 'James Wilson',
      rating: 5,
      text: 'Working with LexPix was effortless and the results were stunning. Highly recommend for any event!',
      date: '2023-12-01'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Review submission will be implemented with Supabase integration.');
    
    // Reset form
    setName('');
    setEmail('');
    setRating(0);
    setReview('');
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
          {mockReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-900 p-6 rounded-lg"
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
              <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Add Review Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <div className="bg-gray-900 p-8 rounded-lg h-full">
              <h3 className="text-2xl font-bold mb-4">What Our Clients Say</h3>
              <p className="text-gray-400 mb-4">
                We value feedback from our clients and strive to deliver exceptional photography services. 
                Read what others have experienced and share your own story with us.
              </p>
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <p className="text-sm text-gray-300">Authentic client reviews</p>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <p className="text-sm text-gray-300">Unedited testimonials</p>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <p className="text-sm text-gray-300">Valuable feedback for improvement</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
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
                  >
                    Submit
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
