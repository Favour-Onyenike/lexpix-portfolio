
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const InviteSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  // Validate the invitation token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        // Check if the token exists and has not expired using RPC function
        const { data, error } = await supabase.rpc('validate_invite_token', {
          p_token: token
        } as any); // Use type assertion to bypass the type checking

        if (error || !data) {
          toast.error('Invalid or expired invitation link');
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        toast.error('Could not validate invitation link');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the user account
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_admin: true,
          }
        }
      });
      
      if (userError) {
        toast.error(userError.message || 'Failed to create account');
        return;
      }
      
      // Mark the token as used
      if (token && userData.user) {
        const { error: updateError } = await supabase.rpc('mark_invite_token_used', {
          p_token: token,
          p_used_by: userData.user.id
        } as any); // Use type assertion to bypass the type checking
          
        if (updateError) {
          console.error('Error updating token:', updateError);
        }
      }
      
      toast.success('Account created successfully! Please check your email for verification.');
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Validating invitation...</p>
      </div>
    );
  }

  if (!isValid && !isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Invalid Invitation</h1>
          <p className="mb-6">This invitation link is invalid or has expired.</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="p-0 h-8 mb-4" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to website
          </Button>
          <h1 className="text-3xl font-semibold mb-2">Join the Team</h1>
          <p className="text-muted-foreground">Create your admin account with your invitation</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteSignup;
