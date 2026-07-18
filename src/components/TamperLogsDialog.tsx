import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TamperLog {
  id: string;
  script_id: string;
  reason: string | null;
  hwid: string | null;
  ip: string | null;
  user_agent: string | null;
  discord_user_id: string | null;
  discord_username: string | null;
  created_at: string;
}

interface Props {
  scriptId: string | null;
  scriptName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASON_LABELS: Record<string, string> = {
  loadstring_hooked: "loadstring hooked",
  httpget_hooked: "HttpGet hooked",
  loadstring_lua_wrapper: "loadstring Lua wrapper",
  loadstring_tostring_leak: "loadstring tostring leak",
};

const TamperLogsDialog = ({ scriptId, scriptName, open, onOpenChange }: Props) => {
  const [logs, setLogs] = useState<TamperLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    if (!scriptId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("tamper_logs")
      .select("*")
      .eq("script_id", scriptId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Failed to load tamper logs", description: error.message, variant: "destructive" });
    } else {
      setLogs((data as TamperLog[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && scriptId) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scriptId]);

  const clearAll = async () => {
    if (!scriptId) return;
    if (!confirm("Delete all tamper logs for this script?")) return;
    setClearing(true);
    const { error } = await supabase.from("tamper_logs").delete().eq("script_id", scriptId);
    setClearing(false);
    if (error) {
      toast({ title: "Failed to clear logs", description: error.message, variant: "destructive" });
    } else {
      setLogs([]);
      toast({ title: "Tamper logs cleared" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            Tamper Logs {scriptName && <span className="text-muted-foreground font-normal">— {scriptName}</span>}
          </DialogTitle>
          <DialogDescription>
            Detected attempts to hook, unwrap, or intercept your protected script. Most recent 200 events.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 pb-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={clearing || logs.length === 0}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear all
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {logs.length} event{logs.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No tamper attempts detected. 🎉
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border rounded-md p-3 bg-card">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <Badge variant="destructive" className="text-xs">
                    {REASON_LABELS[log.reason ?? ""] ?? log.reason ?? "unknown"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">IP: </span>
                    <span className="font-mono">{log.ip ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">HWID: </span>
                    <span className="font-mono break-all">{log.hwid ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discord: </span>
                    <span className="font-mono">
                      {log.discord_username ?? "—"}
                      {log.discord_user_id ? ` (${log.discord_user_id})` : ""}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">User-Agent: </span>
                    <span className="font-mono break-all">{log.user_agent ?? "—"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TamperLogsDialog;
