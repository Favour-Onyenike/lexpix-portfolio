
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { pricingService, PricingCard } from '@/services/pricingService';
import { toast } from 'sonner';

const AdminPricing = () => {
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    features: '',
    is_featured: false,
    sort_order: 0
  });

  const queryClient = useQueryClient();

  const { data: pricingCards = [], isLoading } = useQuery({
    queryKey: ['admin-pricing-cards'],
    queryFn: pricingService.getPricingCards
  });

  const createMutation = useMutation({
    mutationFn: pricingService.createPricingCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-cards'] });
      setIsCreating(false);
      resetForm();
      toast.success('Pricing card created successfully');
    },
    onError: () => {
      toast.error('Failed to create pricing card');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      pricingService.updatePricingCard(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-cards'] });
      setEditingCard(null);
      resetForm();
      toast.success('Pricing card updated successfully');
    },
    onError: () => {
      toast.error('Failed to update pricing card');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: pricingService.deletePricingCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-cards'] });
      toast.success('Pricing card deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete pricing card');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      features: '',
      is_featured: false,
      sort_order: 0
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetForm();
  };

  const handleEdit = (card: PricingCard) => {
    setEditingCard(card.id);
    setFormData({
      title: card.title,
      description: card.description,
      price: card.price.toString(),
      features: card.features?.join('\n') || '',
      is_featured: card.is_featured,
      sort_order: card.sort_order
    });
  };

  const handleSave = () => {
    const featuresArray = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const cardData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      currency: 'CAD',
      features: featuresArray,
      is_featured: formData.is_featured,
      sort_order: formData.sort_order
    };

    if (isCreating) {
      createMutation.mutate(cardData);
    } else if (editingCard) {
      updateMutation.mutate({ id: editingCard, updates: cardData });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCard(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this pricing card?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Manage Pricing</h1>
          <Button onClick={handleCreate} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Card
          </Button>
        </div>

        {(isCreating || editingCard) && (
          <Card>
            <CardHeader>
              <CardTitle>{isCreating ? 'Create New Pricing Card' : 'Edit Pricing Card'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Wedding Package"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the package"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (CAD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Professional editing&#10;High-resolution images&#10;Online gallery"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured Package</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Card className={card.is_featured ? 'border-yellow-400 border-2' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{card.title}</CardTitle>
                      <CardDescription className="mt-2">{card.description}</CardDescription>
                      <div className="mt-3">
                        <span className="text-2xl font-bold">${card.price}</span>
                        <span className="text-gray-600 ml-1">CAD</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(card)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(card.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {card.features && card.features.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-600">
                      {card.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  )}
                  {card.is_featured && (
                    <div className="mt-3">
                      <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {pricingCards.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-gray-600">No pricing cards yet. Create your first one!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
