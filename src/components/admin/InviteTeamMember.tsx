
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Copy, Check, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const InviteTeamMember = () => {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { generateInviteLink } = useAuth();

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const link = await generateInviteLink();
      setInviteLink(link);
    } catch (error) {
      toast.error('Failed to generate invite link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Invite link copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Invite Team Member
        </CardTitle>
        <CardDescription>
          Generate an invitation link to share with your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleGenerateLink}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Invitation Link'}
          </Button>
          
          {inviteLink && (
            <div className="mt-4 space-y-2">
              <div className="flex">
                <Input
                  value={inviteLink}
                  readOnly
                  className="rounded-r-none"
                />
                <Button
                  onClick={handleCopy}
                  className="rounded-l-none"
                  variant="secondary"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link will expire in 7 days. Anyone with this link can create an admin account.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteTeamMember;
