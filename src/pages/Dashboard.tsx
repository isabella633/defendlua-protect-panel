import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Settings, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScriptDashboard from '@/components/ScriptDashboard';
import ScriptProtector from '@/components/ScriptProtector';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProtector, setShowProtector] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">DefendLua Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowProtector(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Protect Script
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>

        {showProtector && (
          <div className="mb-6">
            <ScriptProtector onComplete={() => setShowProtector(false)} />
          </div>
        )}

        <ScriptDashboard />
      </div>
    </div>
  );
}
