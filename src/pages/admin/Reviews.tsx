
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  getAllReviews, 
  updateReviewStatus, 
  deleteReview, 
  type Review 
} from '@/services/reviewService';
import { motion } from 'framer-motion';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      console.log('Loading reviews...');
      const data = await getAllReviews();
      console.log('Loaded reviews:', data);
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

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      console.log('Toggling review status:', id, 'from', currentStatus, 'to', !currentStatus);
      const success = await updateReviewStatus(id, !currentStatus);
      
      if (success) {
        setReviews(reviews.map(review => 
          review.id === id 
            ? { ...review, published: !currentStatus } 
            : review
        ));
        
        toast.success(
          currentStatus 
            ? 'Review hidden from public view' 
            : 'Review published successfully'
        );
      } else {
        toast.error('Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Something went wrong');
    }
  };

  const handleDeleteReview = (id: string) => {
    console.log('Initiating delete for review:', id);
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      console.error('No delete ID set');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Deleting review:', deleteId);
      
      const success = await deleteReview(deleteId);
      console.log('Delete result:', success);
      
      if (success) {
        setReviews(reviews.filter(review => review.id !== deleteId));
        toast.success('Review deleted successfully');
        console.log('Review deleted successfully');
      } else {
        toast.error('Failed to delete review');
        console.error('Delete operation returned false');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Something went wrong while deleting');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Review Management</h1>
          <p className="text-muted-foreground">Manage customer reviews and testimonials</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>
                Review and approve customer feedback. Toggle to show or hide on your website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {review.name}
                          <div className="text-xs text-muted-foreground mt-1">{review.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex">{renderStars(review.rating)}</div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {review.text}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={review.published} 
                              onCheckedChange={() => handleTogglePublished(review.id, review.published)}
                            />
                            <Badge variant={review.published ? "default" : "outline"}>
                              {review.published ? "Published" : "Hidden"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeleting}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    Reviews submitted by users will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminReviews;
