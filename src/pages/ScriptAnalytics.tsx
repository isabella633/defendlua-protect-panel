import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Globe, Shield, XCircle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface LogRow {
  id: string;
  hwid: string;
  ip_address: string | null;
  accessed_at: string;
  status: string;
  reason: string | null;
  country: string | null;
}

const DAYS = 30;

const ScriptAnalytics = () => {
  const { scriptId } = useParams();
  const navigate = useNavigate();
  const [scriptName, setScriptName] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scriptId) return;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

      const [{ data: script }, { data: logRows }] = await Promise.all([
        supabase.from("scripts").select("script_name").eq("id", scriptId).maybeSingle(),
        supabase
          .from("access_logs")
          .select("id, hwid, ip_address, accessed_at, status, reason, country")
          .eq("script_id", scriptId)
          .gte("accessed_at", since)
          .order("accessed_at", { ascending: false })
          .limit(5000),
      ]);

      if (script) setScriptName(script.script_name);
      setLogs((logRows as LogRow[]) || []);
      setLoading(false);
    })();
  }, [scriptId]);

  const perDay = useMemo(() => {
    const map = new Map<string, { day: string; granted: number; denied: number }>();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { day: key.slice(5), granted: 0, denied: 0 });
    }
    for (const l of logs) {
      const key = l.accessed_at.slice(0, 10);
      const row = map.get(key);
      if (!row) continue;
      if (l.status === "granted") row.granted += 1;
      else row.denied += 1;
    }
    return Array.from(map.values());
  }, [logs]);

  const topHwids = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of logs) counts.set(l.hwid, (counts.get(l.hwid) || 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [logs]);

  const byCountry = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of logs) {
      const c = l.country || "Unknown";
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [logs]);

  const kickReasons = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of logs) {
      if (l.status === "denied") {
        const r = l.reason || "Unknown";
        counts.set(r, (counts.get(r) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const totals = useMemo(() => {
    const granted = logs.filter((l) => l.status === "granted").length;
    const denied = logs.filter((l) => l.status === "denied").length;
    return { granted, denied, total: logs.length };
  }, [logs]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              {scriptName || "Script"} — Analytics
            </h1>
            <p className="text-sm text-muted-foreground">Last {DAYS} days (data retained for 90 days)</p>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total executions</CardDescription>
                  <CardTitle className="text-3xl">{totals.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Granted
                  </CardDescription>
                  <CardTitle className="text-3xl text-green-500">{totals.granted}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Denied
                  </CardDescription>
                  <CardTitle className="text-3xl text-red-500">{totals.denied}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Executions per day</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perDay}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="granted" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="denied" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top HWIDs</CardTitle>
                </CardHeader>
                <CardContent>
                  {topHwids.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {topHwids.map(([hwid, count]) => (
                        <div key={hwid} className="flex justify-between text-sm border-b pb-2">
                          <code className="truncate mr-2">{hwid.slice(0, 32)}…</code>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Countries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {byCountry.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    <div className="space-y-2">
                      {byCountry.map(([c, count]) => (
                        <div key={c} className="flex justify-between text-sm border-b pb-2">
                          <span>{c}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Kick / denial reasons</CardTitle>
              </CardHeader>
              <CardContent>
                {kickReasons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No denials 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {kickReasons.map(([r, count]) => (
                      <div key={r} className="flex justify-between text-sm border-b pb-2">
                        <span>{r}</span>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ScriptAnalytics;
