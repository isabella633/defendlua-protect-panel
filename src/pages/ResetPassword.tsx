import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Shield, Lock, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be less than 128 characters");

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const code = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("code");
  }, []);

  useEffect(() => {
    // Listener FIRST (prevents missing auth events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasRecoverySession(!!session);
    });

    // THEN check session / exchange code
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setHasRecoverySession(true);
          return;
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setHasRecoverySession(!!data.session);
        }
      } catch (err: any) {
        toast({
          title: "Reset link error",
          description: err?.message || "That reset link is invalid or expired. Please request a new one.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    })();

    return () => subscription.unsubscribe();
  }, [code, toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Passwords do not match");
      return;
    }
    if (!hasRecoverySession) {
      setFieldError("Please open the password reset link from your email first.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "Password updated",
        description: "You can now continue to your dashboard.",
      });

      navigate("/");
    } catch (err: any) {
      toast({
        title: "Could not update password",
        description: err?.message || "Please request a new reset link and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-primary">DefendLua</h1>
          </div>
          <p className="text-muted-foreground">Set a new password for your account</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset password</CardTitle>
            <CardDescription className="text-center">
              Enter a new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasRecoverySession && (
              <div className="mb-4 text-sm text-muted-foreground">
                Open the reset link from your email to continue.
              </div>
            )}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className={`pl-10 ${fieldError ? "border-destructive" : ""}`}
                    minLength={6}
                    required
                    disabled={isSaving}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={fieldError ? "border-destructive" : ""}
                  minLength={6}
                  required
                  disabled={isSaving}
                  autoComplete="new-password"
                />
              </div>

              {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}

              <Button type="submit" className="w-full" variant="hero" disabled={isSaving || !hasRecoverySession}>
                {isSaving ? "Updating..." : "Update password"}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/")}
                disabled={isSaving}>
                Back to home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
