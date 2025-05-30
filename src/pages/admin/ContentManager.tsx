
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { getAllContentSections, updateContentSection, ContentSection } from '@/services/contentService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';

const ContentManager = () => {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Form states for each content section
  const [formValues, setFormValues] = useState<Record<string, { title: string, content: string }>>({});

  useEffect(() => {
    const loadContentSections = async () => {
      setIsLoading(true);
      try {
        let sections = await getAllContentSections();
        
        // Filter out the "about" section since it's now fixed
        sections = sections.filter(section => section.name !== 'about');
        
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
        
        if (sections.length > 0 && activeTab === '') {
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
    setError(null);
    
    try {
      console.log(`Submitting update for section ${sectionName} with ID ${section.id}`);
      
      const updateData = {
        title: formValues[sectionName].title,
        content: formValues[sectionName].content
      };
      
      const { success, error } = await updateContentSection(section.id, updateData);
      
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
        console.error('Update failed with error:', error);
        const errorMsg = error?.message || 'Failed to update content';
        setError(errorMsg);
        setShowErrorDialog(true);
        toast.error(errorMsg);
        
        // Set debug info
        setDebugInfo({
          sectionId: section.id,
          updateData,
          error
        });
      }
    } catch (error) {
      console.error('Error updating content:', error);
      const errorMsg = 'An unexpected error occurred while updating content.';
      setError(errorMsg);
      setShowErrorDialog(true);
      toast.error(errorMsg);
      
      // Set debug info
      setDebugInfo({
        error,
        section
      });
    } finally {
      setIsSaving(false);
    }
  };

  const showDebugInfo = () => {
    setShowDebugDialog(true);
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

      <Alert className="mb-6 bg-yellow-50 border-yellow-200">
        <InfoIcon className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          The About section is now fixed and cannot be edited through this interface.
        </AlertDescription>
      </Alert>

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
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={showDebugInfo}
                    type="button"
                  >
                    Debug Info
                  </Button>
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
            <p className="text-muted-foreground">No editable content sections found</p>
          </CardContent>
        </Card>
      )}

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Updating Content</DialogTitle>
            <DialogDescription>
              There was an error while updating the content section:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This might be due to a permissions issue with the database. Please ensure your Supabase project has the appropriate RLS policies set up for the content_sections table.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Debug Dialog */}
      <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Debug Information</DialogTitle>
            <DialogDescription>
              Technical details for troubleshooting content updates:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2">Content Sections Data:</h3>
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentSections.map(section => (
                    <TableRow key={section.id}>
                      <TableCell className="font-mono text-xs">{section.id}</TableCell>
                      <TableCell>{section.name}</TableCell>
                      <TableCell>{section.title || '(none)'}</TableCell>
                      <TableCell>{new Date(section.updated_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {debugInfo && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Last Error Data:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDebugDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ContentManager;
