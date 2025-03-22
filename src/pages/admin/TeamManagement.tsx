
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import InviteTeamMember from '@/components/admin/InviteTeamMember';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const TeamManagement = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-2">
            Invite and manage team members who can access the admin dashboard
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <InviteTeamMember />
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeamManagement;
