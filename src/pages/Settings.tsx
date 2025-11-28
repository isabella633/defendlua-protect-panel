import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Palette, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, setTheme, themes } = useTheme();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleThemeChange = async (newTheme: typeof theme) => {
    await setTheme(newTheme);
    toast.success('Theme updated successfully!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Theme Preferences</CardTitle>
            </div>
            <CardDescription>Choose your preferred color theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleThemeChange(t.name)}
                  className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    theme === t.name
                      ? 'border-primary shadow-lg'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: `hsl(${t.colors.primary})` }}
                      />
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: `hsl(${t.colors.secondary})` }}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">{t.label}</Label>
                      {theme === t.name && (
                        <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
