import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { counterService, Counter, CounterUpdate } from '@/services/counterService';

const AdminCounters = () => {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Counter>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCounter, setNewCounter] = useState({
    name: '',
    label: '',
    value: 0,
    sort_order: 0
  });

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      setIsLoading(true);
      const data = await counterService.getCounters();
      setCounters(data);
    } catch (error) {
      toast.error('Failed to load counters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (counter: Counter) => {
    setEditingId(counter.id);
    setEditingData({
      name: counter.name,
      label: counter.label,
      value: counter.value,
      sort_order: counter.sort_order
    });
  };

  const handleSave = async (id: string) => {
    try {
      await counterService.updateCounter(id, editingData as CounterUpdate);
      await loadCounters();
      setEditingId(null);
      setEditingData({});
      toast.success('Counter updated successfully');
    } catch (error) {
      toast.error('Failed to update counter');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this counter?')) {
      try {
        await counterService.deleteCounter(id);
        await loadCounters();
        toast.success('Counter deleted successfully');
      } catch (error) {
        toast.error('Failed to delete counter');
      }
    }
  };

  const handleAddNew = async () => {
    try {
      await counterService.createCounter(newCounter);
      await loadCounters();
      setIsAddingNew(false);
      setNewCounter({ name: '', label: '', value: 0, sort_order: 0 });
      toast.success('Counter created successfully');
    } catch (error) {
      toast.error('Failed to create counter');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            Counter Management
          </motion.h1>
          <Button
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Counter
          </Button>
        </div>

        {/* Add New Counter Form */}
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Add New Counter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="new-name">Name</Label>
                    <Input
                      id="new-name"
                      value={newCounter.name}
                      onChange={(e) => setNewCounter({ ...newCounter, name: e.target.value })}
                      placeholder="e.g., satisfied_clients"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-label">Label</Label>
                    <Input
                      id="new-label"
                      value={newCounter.label}
                      onChange={(e) => setNewCounter({ ...newCounter, label: e.target.value })}
                      placeholder="e.g., Satisfied Clients"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-value">Value</Label>
                    <Input
                      id="new-value"
                      type="number"
                      value={newCounter.value}
                      onChange={(e) => setNewCounter({ ...newCounter, value: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-sort">Sort Order</Label>
                    <Input
                      id="new-sort"
                      type="number"
                      value={newCounter.sort_order}
                      onChange={(e) => setNewCounter({ ...newCounter, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddNew} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewCounter({ name: '', label: '', value: 0, sort_order: 0 });
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Counters List */}
        <div className="space-y-4">
          {counters.map((counter, index) => (
            <motion.div
              key={counter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  {editingId === counter.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`name-${counter.id}`}>Name</Label>
                          <Input
                            id={`name-${counter.id}`}
                            value={editingData.name || ''}
                            onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`label-${counter.id}`}>Label</Label>
                          <Input
                            id={`label-${counter.id}`}
                            value={editingData.label || ''}
                            onChange={(e) => setEditingData({ ...editingData, label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`value-${counter.id}`}>Value</Label>
                          <Input
                            id={`value-${counter.id}`}
                            type="number"
                            value={editingData.value || 0}
                            onChange={(e) => setEditingData({ ...editingData, value: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`sort-${counter.id}`}>Sort Order</Label>
                          <Input
                            id={`sort-${counter.id}`}
                            type="number"
                            value={editingData.sort_order || 0}
                            onChange={(e) => setEditingData({ ...editingData, sort_order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSave(counter.id)} className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <div className="text-sm text-gray-500">Name</div>
                          <div className="font-medium">{counter.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Label</div>
                          <div className="font-medium">{counter.label}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Value</div>
                          <div className="text-2xl font-bold text-primary">{counter.value}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Sort Order</div>
                          <div className="font-medium">{counter.sort_order}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(counter)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(counter.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {counters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No counters found</div>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Counter
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCounters;