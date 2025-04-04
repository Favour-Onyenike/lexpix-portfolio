
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getAllContentSections, updateContentSection, ContentSection } from '@/services/contentService';

const ContentManager = () => {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const navigate = useNavigate();

  // Form states for each content section
  const [formValues, setFormValues] = useState<Record<string, { title: string, content: string }>>({});

  useEffect(() => {
    const loadContentSections = async () => {
      setIsLoading(true);
      try {
        const sections = await getAllContentSections();
        setContentSections(sections);
        
        // Initialize form values
        const initialFormValues: Record<string, { title: string, content: string }> = {};
        sections.forEach(section => {
          initialFormValues[section.name] = {
            title: section.title || '',
            content: section.content
          };
        });
        setFormValues(initialFormValues);
        
        if (sections.length > 0 && !sections.find(s => s.name === activeTab)) {
          setActiveTab(sections[0].name);
        }
      } catch (error) {
        console.error('Error loading content sections:', error);
        toast.error('Failed to load content sections');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContentSections();
  }, []);

  const handleInputChange = (sectionName: string, field: 'title' | 'content', value: string) => {
    setFormValues(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (sectionName: string) => {
    const section = contentSections.find(s => s.name === sectionName);
    if (!section) return;
    
    setIsSaving(true);
    try {
      const success = await updateContentSection(section.id, {
        title: formValues[sectionName].title,
        content: formValues[sectionName].content
      });
      
      if (success) {
        toast.success('Content updated successfully');
        
        // Update local state
        setContentSections(prev => prev.map(s => 
          s.id === section.id 
            ? { 
                ...s, 
                title: formValues[sectionName].title, 
                content: formValues[sectionName].content,
                updated_at: new Date().toISOString()
              } 
            : s
        ));
      } else {
        toast.error('Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Website Content Manager</h1>
        <p className="text-muted-foreground mt-1">Edit content sections displayed on the website</p>
      </div>

      {contentSections.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {contentSections.map(section => (
              <TabsTrigger key={section.id} value={section.name} className="capitalize">
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {contentSections.map(section => (
            <TabsContent key={section.id} value={section.name}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{section.name} Section</CardTitle>
                  <CardDescription>
                    Last updated on {new Date(section.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${section.name}-title`}>Title</Label>
                    <Input 
                      id={`${section.name}-title`}
                      value={formValues[section.name]?.title || ''}
                      onChange={(e) => handleInputChange(section.name, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${section.name}-content`}>Content</Label>
                    <Textarea 
                      id={`${section.name}-content`}
                      rows={10}
                      value={formValues[section.name]?.content || ''}
                      onChange={(e) => handleInputChange(section.name, 'content', e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => handleSubmit(section.name)}
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No content sections found</p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
};

export default ContentManager;
