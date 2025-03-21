
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { setupDatabase } from '@/lib/setupDatabase';

const DatabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const success = await setupDatabase();
        
        if (success) {
          console.log('Database initialized successfully');
          setInitialized(true);
        } else {
          throw new Error('Failed to initialize database');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        toast.error('Failed to initialize database');
      }
    };

    initializeDatabase();
  }, []);

  return null;
};

export default DatabaseInitializer;
