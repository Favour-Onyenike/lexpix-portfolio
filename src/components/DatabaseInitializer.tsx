
import { useEffect, useState } from 'react';
import { setupDatabase } from '@/lib/setupDatabase';
import { useToast } from '@/components/ui/use-toast';

const DatabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        const success = await setupDatabase();
        if (success) {
          setInitialized(true);
          console.log('Database initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        toast({
          title: 'Database Initialization Error',
          description: 'Could not setup the database. Some features may not work correctly.',
          variant: 'destructive',
        });
      }
    };

    init();
  }, [toast]);

  return null; // This component doesn't render anything
};

export default DatabaseInitializer;
