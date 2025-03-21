import { createClient } from '@supabase/supabase-js';

// For deployment, these values should be set in your hosting environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock Supabase client for local development and simple deployment
export const supabase = {
  // Storage API (mock implementation)
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        // Store file in localStorage for demo purposes
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            // Save to localStorage
            const storageKey = `supabase_storage_${bucket}_${path}`;
            localStorage.setItem(storageKey, dataUrl);
            resolve({ error: null, data: { path } });
          };
          reader.readAsDataURL(file);
        });
      },
      remove: async (paths: string[]) => {
        // Remove files from localStorage
        paths.forEach(path => {
          const storageKey = `supabase_storage_${bucket}_${path}`;
          localStorage.removeItem(storageKey);
        });
        return { error: null, data: null };
      },
      getPublicUrl: (path: string) => {
        // Return the localStorage key as the URL
        const storageKey = `supabase_storage_${bucket}_${path}`;
        const storedData = localStorage.getItem(storageKey);
        return { data: { publicUrl: storedData || '' } };
      },
      list: async () => {
        // List all files in this bucket from localStorage
        const files = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`supabase_storage_${bucket}_`)) {
            const path = key.replace(`supabase_storage_${bucket}_`, '');
            files.push({ name: path });
          }
        }
        return { data: files, error: null };
      }
    }),
    listBuckets: async () => ({ data: [{ name: 'images' }] }),
    // Fixed: createBucket should accept a name but ignore it in our mock
    createBucket: async (name: string) => ({ error: null })
  },
  
  // Database API (mock implementation using localStorage)
  from: (table: string) => {
    return {
      select: (columns = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: async () => {
                const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
                const item = tableData.find((item: any) => item[column] === value);
                return { data: item || null, error: null };
              },
              // Added this method to match usage in our code
              async then(callback: (result: any) => void) {
                const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
                const items = tableData.filter((item: any) => item[column] === value);
                callback({ data: items, error: null });
              }
            };
          },
          order: (orderColumn: string, { ascending }: { ascending: boolean }) => {
            return {
              async then(callback: (result: any) => void) {
                const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
                const sortedData = [...tableData].sort((a, b) => {
                  if (a[orderColumn] < b[orderColumn]) return ascending ? -1 : 1;
                  if (a[orderColumn] > b[orderColumn]) return ascending ? 1 : -1;
                  return 0;
                });
                callback({ data: sortedData, error: null });
              }
            };
          },
          async then(callback: (result: any) => void) {
            const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
            callback({ data: tableData, error: null });
          }
        };
      },
      insert: (items: any[]) => {
        return {
          select: () => {
            return {
              single: async () => {
                const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
                const newItems = items.map(item => ({
                  ...item,
                  id: item.id || crypto.randomUUID(),
                  created_at: new Date().toISOString()
                }));
                const updatedData = [...tableData, ...newItems];
                localStorage.setItem(`supabase_${table}`, JSON.stringify(updatedData));
                return { data: newItems[0], error: null };
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return {
              async then(callback: (result: any) => void) {
                const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
                const newData = tableData.filter((item: any) => item[column] !== value);
                localStorage.setItem(`supabase_${table}`, JSON.stringify(newData));
                callback({ error: null });
              }
            };
          }
        };
      },
      update: (items: any) => {
        return {
          eq: (column: string, value: any) => {
            return {
              async then(callback: (result: any) => void) {
                const tableData = JSON.parse(localStorage.getItem(`supabase_${table}`) || '[]');
                const updatedData = tableData.map((item: any) => {
                  if (item[column] === value) {
                    return { ...item, ...items };
                  }
                  return item;
                });
                localStorage.setItem(`supabase_${table}`, JSON.stringify(updatedData));
                callback({ error: null, data: items });
              }
            };
          }
        };
      }
    };
  },
  
  // RPC API (mock implementation)
  rpc: (functionName: string) => {
    return {
      async then(callback: (result: any) => void) {
        // Simply log the function call and return success
        console.log(`Called RPC function: ${functionName}`);
        callback({ error: null });
      }
    };
  },
  
  // Auth API (mock implementation with fixed credentials)
  auth: {
    getUser: async () => {
      const isAuthenticated = localStorage.getItem('admin_email') === 'admin@lexpix.com';
      return {
        data: {
          user: isAuthenticated ? { id: 'admin-user-id', email: 'admin@lexpix.com' } : null
        }
      };
    },
    getSession: async () => {
      const isAuthenticated = localStorage.getItem('admin_email') === 'admin@lexpix.com';
      return {
        data: {
          session: isAuthenticated ? { user: { id: 'admin-user-id', email: 'admin@lexpix.com' } } : null
        }
      };
    }
  }
};

// Fixed admin credentials for easy authentication
// In a real-world app, this would be handled more securely
const ADMIN_EMAIL = "admin@lexpix.com";
const ADMIN_PASSWORD = "admin123";

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  // For simplicity and because this is a personal site with only one admin user
  // we're using a fixed credential check
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Use a mock successful response
    return {
      data: { user: { email: ADMIN_EMAIL, id: "admin-user-id" }, session: {} },
      error: null
    };
  }
  
  // If credentials don't match, return an error
  return {
    data: { user: null, session: null },
    error: { message: "Invalid login credentials" }
  };
};

export const signOut = async () => {
  // Since we're using fixed authentication, we don't need to call Supabase
  return { error: null };
};

// Check if user is authenticated (for client-side protection)
export const isAuthenticated = () => {
  // For development simplicity, we just check if we have the admin email in local storage
  const storedEmail = localStorage.getItem('admin_email');
  return storedEmail === ADMIN_EMAIL;
};

// Set authentication state
export const setAuthenticated = (isAuth: boolean) => {
  if (isAuth) {
    localStorage.setItem('admin_email', ADMIN_EMAIL);
  } else {
    localStorage.removeItem('admin_email');
  }
};
