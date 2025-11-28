import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Plus, 
  Search, 
  Calendar, 
  Code, 
  Eye, 
  Trash2,
  LogOut,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Script {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
  size: string;
  status: 'protected' | 'processing' | 'error';
}

interface ScriptDashboardProps {
  onNewScript: () => void;
  onViewScript: (scriptId: string) => void;
  onLogout: () => void;
}

const ScriptDashboard = ({ onNewScript, onViewScript, onLogout }: ScriptDashboardProps) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading existing scripts
    const mockScripts: Script[] = [
      {
        id: "script_1703845200000",
        name: "GameHack_Ultimate",
        createdAt: new Date("2024-08-20T10:30:00"),
        lastModified: new Date("2024-08-21T15:45:00"),
        size: "15.2 KB",
        status: "protected"
      },
      {
        id: "script_1703831600000",
        name: "AutoFarm_Pro",
        createdAt: new Date("2024-08-19T14:20:00"),
        lastModified: new Date("2024-08-19T14:20:00"),
        size: "8.7 KB",
        status: "protected"
      },
      {
        id: "script_1703818000000",
        name: "SpeedHack_Elite",
        createdAt: new Date("2024-08-18T09:15:00"),
        lastModified: new Date("2024-08-20T11:30:00"),
        size: "12.4 KB",
        status: "protected"
      }
    ];
    
    setTimeout(() => {
      setScripts(mockScripts);
    }, 500);
  }, []);

  const filteredScripts = scripts.filter(script =>
    script.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteScript = (scriptId: string) => {
    setScripts(prev => prev.filter(s => s.id !== scriptId));
    toast({
      title: "Script Deleted",
      description: "The script has been permanently removed.",
    });
  };

  const getStatusColor = (status: Script['status']) => {
    switch (status) {
      case 'protected': return 'bg-primary/10 text-primary';
      case 'processing': return 'bg-accent/10 text-accent';
      case 'error': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">DefendLua</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Dashboard
            </Badge>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Protected Scripts</h2>
              <p className="text-muted-foreground">
                Manage and monitor all your Lua scripts protected by DefendLua
              </p>
            </div>
            <Button onClick={onNewScript} variant="hero" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Protect New Script
            </Button>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your scripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{scripts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Scripts</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {scripts.filter(s => s.status === 'protected').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Protected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scripts Grid */}
          {filteredScripts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? "No scripts found" : "No scripts yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Start by protecting your first Lua script"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={onNewScript} variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Protect Your First Script
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScripts.map((script) => (
                <Card key={script.id} className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{script.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(script.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(script.status)}>
                        {script.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Size: {script.size}</span>
                        <span>Modified: {formatDate(script.lastModified)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => onViewScript(script.id)}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                        
                        <Button
                          onClick={() => deleteScript(script.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:border-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScriptDashboard;