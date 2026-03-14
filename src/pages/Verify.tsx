import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type VerifyStatus = "loading" | "redirecting" | "verifying" | "complete" | "error" | "bypass";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [scriptName, setScriptName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    handleFlow();
  }, []);

  const handleFlow = async () => {
    // Case 1: Fresh visit with token from Discord — store token, redirect to provider
    if (tokenFromUrl) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/verify-key-link?token=${tokenFromUrl}&format=json`);
        const data = await res.json();

        if (!res.ok || data.error) {
          setStatus("error");
          setErrorMessage(data.error || "Something went wrong.");
          return;
        }

        // Store token and timestamp in sessionStorage
        localStorage.setItem("defendlua_verify_token", tokenFromUrl);
        localStorage.setItem("defendlua_verify_time", Date.now().toString());
        setScriptName(data.scriptName || "Unknown Script");
        setStatus("redirecting");

        // Redirect to provider link after a brief moment
        setTimeout(() => {
          window.location.href = data.providerLink;
        }, 1500);
      } catch {
        setStatus("error");
        setErrorMessage("Failed to load verification. Please try again.");
      }
      return;
    }

    // Case 2: Returning from provider (no token in URL, but token in sessionStorage)
    const savedToken = localStorage.getItem("defendlua_verify_token");
    const savedTime = localStorage.getItem("defendlua_verify_time");

    if (!savedToken) {
      setStatus("error");
      setErrorMessage("No verification session found. Please use /getkey in Discord to get a new link.");
      return;
    }

    // Check minimum time spent (30 seconds)
    const timeSpent = Date.now() - parseInt(savedTime || "0", 10);
    const MIN_TIME_MS = 30 * 1000;

    if (timeSpent < MIN_TIME_MS) {
      setStatus("bypass");
      setErrorMessage("You haven't completed the task yet. Do not try to bypass the key system. Go back and complete the full task.");
      return;
    }

    // Attempt to complete verification and get the key
    setStatus("verifying");
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-key-link?token=${savedToken}&complete=true`);
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedKey(data.key);
        setScriptName(data.scriptName || "Unknown Script");
        setExpiresAt(data.expiresAt || "");
        setStatus("complete");
        // Clean up session
        localStorage.removeItem("defendlua_verify_token");
        localStorage.removeItem("defendlua_verify_time");
      } else if (data.bypass) {
        setStatus("bypass");
        setErrorMessage(data.error || "Bypass detected. Complete the full task.");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Verification failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to verify. Please try again.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiry = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffH = Math.round((d.getTime() - now.getTime()) / 3600000);
    return `${diffH} hours`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#1a1a2e", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="max-w-md w-full p-10 rounded-2xl text-center" style={{ background: "#16213e", border: "1px solid #0f3460", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div className="text-4xl mb-5">🛡️</div>

        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#5865F2" }}>Loading...</h1>
            <p style={{ color: "#aaa" }}>Please wait while we prepare your verification...</p>
          </>
        )}

        {status === "redirecting" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#5865F2" }}>🔗 Redirecting...</h1>
            <p style={{ color: "#aaa", lineHeight: 1.6 }}>
              You're being redirected to complete the task.
              <br /><br />
              After completing it, you'll be automatically redirected back here to receive your key.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#5865F2 transparent transparent transparent" }} />
            </div>
          </>
        )}

        {status === "verifying" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#5865F2" }}>⏳ Verifying...</h1>
            <p style={{ color: "#aaa" }}>Checking your completion status...</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: "#43b581 transparent transparent transparent" }} />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#ff6b6b" }}>❌ Error</h1>
            <p style={{ color: "#aaa", lineHeight: 1.6 }}>{errorMessage}</p>
          </>
        )}

        {status === "bypass" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#ff6b6b" }}>🚫 Bypass Detected</h1>
            <p style={{ color: "#aaa", lineHeight: 1.6 }}>{errorMessage}</p>
            <div className="mt-5 p-3 rounded-lg text-xs" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b" }}>
              ⚠️ Do not attempt to bypass the key system. Complete the full task to receive your key.
            </div>
          </>
        )}

        {status === "complete" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#43b581" }}>✅ Key Generated!</h1>
            <p className="mb-2" style={{ color: "#aaa" }}>
              Your key for <strong style={{ color: "#fff" }}>{scriptName}</strong>:
            </p>
            <div
              className="my-4 p-4 rounded-lg cursor-pointer select-all transition-colors"
              style={{ background: "#0f3460", border: "1px solid #5865F2" }}
              onClick={handleCopy}
            >
              <code className="text-lg font-mono font-bold tracking-wider" style={{ color: "#43b581" }}>
                {generatedKey}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className="px-6 py-2 rounded-lg font-bold text-sm text-white transition-transform hover:scale-105 mb-4"
              style={{ background: copied ? "#43b581" : "linear-gradient(135deg, #5865F2, #7289DA)" }}
            >
              {copied ? "✅ Copied!" : "📋 Copy Key"}
            </button>
            {expiresAt && (
              <p className="text-sm mt-2" style={{ color: "#aaa" }}>
                ⏰ Expires in: <strong style={{ color: "#ff6b6b" }}>{formatExpiry(expiresAt)}</strong>
              </p>
            )}
            <div className="mt-5 p-3 rounded-lg text-xs" style={{ background: "rgba(67,181,129,0.1)", border: "1px solid rgba(67,181,129,0.3)", color: "#43b581" }}>
              Use <code>/redeem {generatedKey} &lt;your_hwid&gt;</code> in Discord to activate your access!
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
