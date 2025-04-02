
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { setupDatabase } from '@/lib/setupDatabase';

const DatabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Starting database initialization...');
        const success = await setupDatabase();
        
        if (success) {
          console.log('Database initialized successfully');
          setInitialized(true);
          toast.success('Connected to database successfully');
        } else {
          console.error('Failed to initialize database: setupDatabase returned false');
          toast.error('Database initialization encountered issues - some features may be limited');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        toast.error('Error connecting to database: ' + (error instanceof Error ? error.message : String(error)));
      }
    };

    initializeDatabase();
  }, []);

  return null;
};

export default DatabaseInitializer;
