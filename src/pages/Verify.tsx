import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "ready" | "waiting" | "complete" | "error" | "bypass">("loading");
  const [provider, setProvider] = useState("");
  const [providerLink, setProviderLink] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [errorMessage, setErrorMessage] = useState("");
  const [timerStarted, setTimerStarted] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid request. No verification token provided.");
      return;
    }

    // Check if this is a completion callback
    const complete = searchParams.get("complete");
    if (complete === "true") {
      handleComplete();
    } else {
      loadVerification();
    }
  }, [token]);

  useEffect(() => {
    if (!timerStarted || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, countdown]);

  const loadVerification = async () => {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-key-link?token=${token}&format=json`);
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong.");
        return;
      }

      setProvider(data.provider || "Link");
      setProviderLink(data.providerLink || "");
      setScriptName(data.scriptName || "Unknown Script");
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to load verification. Please try again.");
    }
  };

  const handleComplete = async () => {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/verify-key-link?token=${token}&complete=true`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus("complete");
      } else if (res.status === 403 || data.bypass) {
        setStatus("bypass");
        setErrorMessage(data.error || "You haven't completed the task yet.");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Verification failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Failed to verify. Please try again.");
    }
  };

  const handleOpenLink = () => {
    if (providerLink) {
      window.open(providerLink, "_blank");
    }
    setTimerStarted(true);
    setStatus("waiting");
  };

  const handleVerify = () => {
    if (countdown > 0) return;
    // Navigate to completion
    window.location.href = `${window.location.origin}/verify?token=${token}&complete=true`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#1a1a2e", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="max-w-md w-full p-10 rounded-2xl text-center" style={{ background: "#16213e", border: "1px solid #0f3460", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div className="text-4xl mb-5">🛡️</div>

        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#5865F2" }}>Loading...</h1>
            <p style={{ color: "#aaa" }}>Please wait while we load your verification...</p>
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

        {status === "ready" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#5865F2" }}>🔑 Get Key for {scriptName}</h1>
            <p style={{ color: "#aaa", lineHeight: 1.6 }}>Complete the {provider} task below to verify and get your key.</p>
            <div className="mt-8">
              <p className="text-sm mb-4" style={{ color: "#aaa" }}>Step 1: Complete the {provider} task</p>
              <button
                onClick={handleOpenLink}
                className="inline-block px-8 py-3.5 rounded-lg font-bold text-base text-white transition-transform hover:scale-105"
                style={{ background: "linear-gradient(135deg, #5865F2, #7289DA)" }}
              >
                🔗 Open {provider} Link
              </button>
            </div>
            <div className="mt-5 p-3 rounded-lg text-xs" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b" }}>
              ⚠️ Attempting to bypass verification will result in no key being generated. Complete the full task to receive your key.
            </div>
          </>
        )}

        {status === "waiting" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#5865F2" }}>🔑 Get Key for {scriptName}</h1>
            <p style={{ color: "#aaa", lineHeight: 1.6 }}>Complete the {provider} task, then verify below.</p>
            <div className="mt-8">
              <p className="text-sm mb-2" style={{ color: "#aaa" }}>Step 2: After completing the task, click below to verify</p>
              {countdown > 0 ? (
                <>
                  <p className="text-sm mb-4" style={{ color: "#ff6b6b" }}>⏳ Please wait {countdown}s while completing the task...</p>
                  <button
                    disabled
                    className="inline-block px-8 py-3.5 rounded-lg font-bold text-base cursor-not-allowed"
                    style={{ background: "#444", color: "#888" }}
                  >
                    ⏳ Wait {countdown}s...
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm mb-4" style={{ color: "#00ff00" }}>✅ You can now verify!</p>
                  <button
                    onClick={handleVerify}
                    className="inline-block px-8 py-3.5 rounded-lg font-bold text-base text-white cursor-pointer transition-transform hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #43b581, #3ca374)" }}
                  >
                    ✅ I completed the task — Verify Now
                  </button>
                </>
              )}
            </div>
            <div className="mt-5 p-3 rounded-lg text-xs" style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", color: "#ff6b6b" }}>
              ⚠️ Attempting to bypass verification will result in no key being generated. Complete the full task to receive your key.
            </div>
          </>
        )}

        {status === "complete" && (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: "#43b581" }}>✅ Verification Complete!</h1>
            <p style={{ color: "#aaa", lineHeight: 1.6 }}>
              You've successfully completed the task!
              <br /><br />
              Go back to Discord and click the <strong style={{ color: "#fff" }}>"I completed the link"</strong> button to receive your key.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
