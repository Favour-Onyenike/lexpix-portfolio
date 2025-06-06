
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pricingService } from '@/services/pricingService';

const Pricing = () => {
  const { data: pricingCards = [], isLoading } = useQuery({
    queryKey: ['pricing-cards'],
    queryFn: pricingService.getPricingCards
  });

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to home page contact section
      window.location.hash = '/';
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="text-yellow-400">Pricing</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional photography services with transparent pricing. 
              Choose the package that best fits your needs.
            </p>
          </motion.div>

          {pricingCards.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-600 text-lg">No pricing packages available at the moment.</p>
              <p className="text-gray-500 mt-2">Please contact us for custom pricing.</p>
              <Button onClick={handleContactClick} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black">
                Contact Us
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {pricingCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className={`relative h-full ${card.is_featured ? 'border-yellow-400 border-2 shadow-lg' : ''}`}>
                    {card.is_featured && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-bold">{card.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        {card.description}
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${card.price}</span>
                        <span className="text-gray-600 ml-1">{card.currency}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {card.features && card.features.length > 0 && (
                        <ul className="space-y-3">
                          {card.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center">
                              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-8">
                        <Button 
                          onClick={handleContactClick}
                          className={`w-full ${
                            card.is_featured 
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                              : 'bg-black hover:bg-gray-800 text-white'
                          }`}
                        >
                          Get Started
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
