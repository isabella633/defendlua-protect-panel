import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Trash2, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OwnerPanelProps {
  scriptId: string;
  scriptName: string;
  onClose: () => void;
}

const OwnerPanel = ({ scriptId, scriptName, onClose }: OwnerPanelProps) => {
  const [hwids, setHwids] = useState<string[]>([]);
  const [newHwid, setNewHwid] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScript();
  }, [scriptId]);

  const loadScript = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('hwid_list')
        .eq('id', scriptId)
        .single();

      if (error) throw error;
      setHwids(data?.hwid_list || []);
    } catch (error: any) {
      toast.error("Failed to load script data");
    } finally {
      setLoading(false);
    }
  };

  const addHwid = async () => {
    if (!newHwid) {
      toast.error("Please enter a HWID");
      return;
    }
    
    if (hwids.includes(newHwid)) {
      toast.error("HWID already exists");
      return;
    }
    
    try {
      const updatedHwids = [...hwids, newHwid];
      
      const { error } = await supabase
        .from('scripts')
        .update({ hwid_list: updatedHwids })
        .eq('id', scriptId);

      if (error) throw error;

      setHwids(updatedHwids);
      setNewHwid("");
      toast.success("HWID added successfully!");
    } catch (error: any) {
      toast.error("Failed to add HWID");
    }
  };

  const removeHwid = async (hwid: string) => {
    try {
      const updatedHwids = hwids.filter(h => h !== hwid);
      
      const { error } = await supabase
        .from('scripts')
        .update({ hwid_list: updatedHwids })
        .eq('id', scriptId);

      if (error) throw error;

      setHwids(updatedHwids);
      toast.success("HWID removed successfully!");
    } catch (error: any) {
      toast.error("Failed to remove HWID");
    }
  };

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{scriptName}</CardTitle>
              <CardDescription>Manage HWID whitelist</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter HWID"
            value={newHwid}
            onChange={(e) => setNewHwid(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHwid()}
          />
          <Button onClick={addHwid}>Add</Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Whitelisted HWIDs</span>
            <Badge variant="secondary">{hwids.length} total</Badge>
          </div>
          
          {hwids.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No HWIDs whitelisted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hwids.map((hwid) => (
                <div
                  key={hwid}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-primary" />
                    <p className="font-mono text-sm">{hwid}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHwid(hwid)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerPanel;
