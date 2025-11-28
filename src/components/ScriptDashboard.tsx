import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import OwnerPanel from "./OwnerPanel";

interface Script {
  id: string;
  script_name: string;
  script_key: string;
  hwid_list: string[];
  created_at: string;
}

const ScriptDashboard = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadScripts();
    }
  }, [user]);

  const loadScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error: any) {
      toast.error("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard!");
  };

  const deleteScript = async (scriptId: string) => {
    try {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId);

      if (error) throw error;
      toast.success("Script deleted successfully");
      loadScripts();
    } catch (error: any) {
      toast.error("Failed to delete script");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Your Protected Scripts</CardTitle>
          </div>
          <CardDescription>Manage and monitor your protected Lua scripts</CardDescription>
        </CardHeader>
        <CardContent>
          {scripts.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scripts protected yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scripts.map((script) => (
                <Card key={script.id} className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{script.script_name}</h3>
                          <Badge variant="secondary">{script.hwid_list.length} HWIDs</Badge>
                          <Badge className="bg-success/10 text-success hover:bg-success/20">
                            active
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-3 py-1 rounded text-muted-foreground">
                            {script.script_key}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyKey(script.script_key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedScript(script.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteScript(script.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedScript && (
        <OwnerPanel
          scriptId={selectedScript}
          scriptName={scripts.find(s => s.id === selectedScript)?.script_name || ""}
          onClose={() => {
            setSelectedScript(null);
            loadScripts();
          }}
        />
      )}
    </div>
  );
};

export default ScriptDashboard;
