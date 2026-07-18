import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  content: string;
  created_at: string;
}

interface Props {
  scriptId: string | null;
  scriptName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored?: () => void;
}

const VersionHistoryDialog = ({ scriptId, scriptName, open, onOpenChange, onRestored }: Props) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selected, setSelected] = useState<Version | null>(null);
  const [loading, setLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !scriptId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("script_versions")
        .select("id, content, created_at")
        .eq("script_id", scriptId)
        .order("created_at", { ascending: false })
        .limit(10);
      const rows = (data as Version[]) || [];
      setVersions(rows);
      setSelected(rows[0] ?? null);
      setLoading(false);
    })();
  }, [open, scriptId]);

  const rollback = async () => {
    if (!scriptId || !selected) return;
    setRollingBack(true);
    const { error } = await supabase
      .from("scripts")
      .update({ script_key: selected.content })
      .eq("id", scriptId);
    setRollingBack(false);
    if (error) {
      toast({ title: "Rollback failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Rolled back", description: "Script restored to selected version." });
    onOpenChange(false);
    onRestored?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Version history — {scriptName}
          </DialogTitle>
          <DialogDescription>Last 10 saves. Pick one to preview, then roll back.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No versions yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 max-h-96 overflow-auto">
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`w-full text-left p-2 rounded border text-xs ${
                    selected?.id === v.id ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{new Date(v.created_at).toLocaleString()}</span>
                    {i === 0 && <Badge variant="outline">Current</Badge>}
                  </div>
                  <div className="text-muted-foreground">{v.content.length} chars</div>
                </button>
              ))}
            </div>
            <div className="md:col-span-2">
              <pre className="text-xs bg-muted p-3 rounded max-h-96 overflow-auto whitespace-pre-wrap break-all">
                {selected?.content ?? ""}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={rollback}
            disabled={!selected || rollingBack || versions[0]?.id === selected?.id}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {rollingBack ? "Rolling back…" : "Roll back to this version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryDialog;
