import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Invalid request.", { status: 400, headers: { "Content-Type": "text/html" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Look up the verification record
  const { data: verification, error } = await supabase
    .from("key_link_verifications")
    .select("*, scripts:script_id(script_name)")
    .eq("token", token)
    .single();

  if (error || !verification) {
    return new Response(renderPage("Invalid or Expired Link", "This verification link is invalid or has already expired. Please use /getkey again in Discord.", null, true), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Check if already completed
  if (verification.completed) {
    return new Response(renderPage("Already Completed", "You've already completed this verification. Go back to Discord and click the button to get your key.", null, true), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Check if expired (10 minutes max)
  const createdAt = new Date(verification.created_at).getTime();
  if (Date.now() - createdAt > 10 * 60 * 1000) {
    return new Response(renderPage("Link Expired", "This verification link has expired. Please use /getkey again in Discord.", null, true), {
      status: 410,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Get the provider link from key_system_configs
  const { data: config } = await supabase
    .from("key_system_configs")
    .select("provider_link, provider")
    .eq("script_id", verification.script_id)
    .eq("enabled", true)
    .single();

  if (!config) {
    return new Response(renderPage("Key System Disabled", "The key system for this script has been disabled.", null, true), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Mark as visited (but NOT completed yet)
  if (!verification.visited_at) {
    await supabase
      .from("key_link_verifications")
      .update({ visited_at: new Date().toISOString() })
      .eq("id", verification.id);
  }

  // Handle the completion callback (user returns after completing the link)
  if (url.searchParams.get("complete") === "true") {
    // Verify they actually visited first and waited enough time
    const visitedAt = verification.visited_at ? new Date(verification.visited_at).getTime() : Date.now();
    const timeSpent = Date.now() - visitedAt;
    const MIN_TIME_MS = 30 * 1000; // 30 seconds minimum

    if (timeSpent < MIN_TIME_MS) {
      const remaining = Math.ceil((MIN_TIME_MS - timeSpent) / 1000);
      return new Response(renderPage(
        "⚠️ Bypass Detected",
        `You haven't completed the ${config.provider} task yet. You need to spend at least 30 seconds completing it.\n\nPlease go back, complete the task, and try again in ${remaining} seconds.\n\n🚫 Do not try to bypass the key system.`,
        null,
        true
      ), {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Mark as completed
    await supabase
      .from("key_link_verifications")
      .update({ completed: true })
      .eq("id", verification.id);

    return new Response(renderPage(
      "✅ Verification Complete!",
      `You've successfully completed the ${config.provider} task!\n\nGo back to Discord and click the "I completed the link" button to receive your key.`,
      null,
      false
    ), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Show the initial page with the provider link
  const scriptName = verification.scripts?.script_name || "Unknown Script";
  return new Response(renderPage(
    `🔑 Get Key for ${scriptName}`,
    `Complete the ${config.provider} task below to verify and get your key.`,
    { providerLink: config.provider_link, provider: config.provider, token },
    false
  ), {
    headers: { "Content-Type": "text/html" },
  });
});

function renderPage(title: string, message: string, linkData: { providerLink: string; provider: string; token: string } | null, isError: boolean): string {
  const baseUrl = Deno.env.get("SUPABASE_URL")!;
  
  const linkSection = linkData ? `
    <div style="margin: 30px 0; text-align: center;">
      <p style="color: #aaa; margin-bottom: 15px;">Step 1: Complete the ${linkData.provider} task</p>
      <a href="${linkData.providerLink}" target="_blank" rel="noopener" id="provider-link" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #5865F2, #7289DA); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s;"
         onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"
         onclick="startTimer()">
        🔗 Open ${linkData.provider} Link
      </a>
    </div>
    <div id="step2" style="margin: 30px 0; text-align: center; display: none;">
      <p style="color: #aaa; margin-bottom: 10px;">Step 2: After completing the task, click below to verify</p>
      <div id="timer" style="color: #ff6b6b; font-size: 14px; margin-bottom: 15px;"></div>
      <a id="verify-btn" href="#" 
         style="display: inline-block; padding: 14px 32px; background: #444; color: #888; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; pointer-events: none; cursor: not-allowed;"
         >
        ⏳ Complete the task first...
      </a>
    </div>
    <script>
      let timerStarted = false;
      let startTime = 0;
      const WAIT_TIME = 30;
      
      function startTimer() {
        if (timerStarted) return;
        timerStarted = true;
        startTime = Date.now();
        document.getElementById('step2').style.display = 'block';
        updateTimer();
      }
      
      function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = WAIT_TIME - elapsed;
        const timerEl = document.getElementById('timer');
        const btn = document.getElementById('verify-btn');
        
        if (remaining > 0) {
          timerEl.textContent = '⏳ Please wait ' + remaining + 's while completing the task...';
          btn.textContent = '⏳ Wait ' + remaining + 's...';
          btn.style.background = '#444';
          btn.style.color = '#888';
          btn.style.pointerEvents = 'none';
          btn.style.cursor = 'not-allowed';
          setTimeout(updateTimer, 1000);
        } else {
          timerEl.textContent = '✅ You can now verify!';
          timerEl.style.color = '#00ff00';
          btn.textContent = '✅ I completed the task — Verify Now';
          btn.style.background = 'linear-gradient(135deg, #43b581, #3ca374)';
          btn.style.color = 'white';
          btn.style.pointerEvents = 'auto';
          btn.style.cursor = 'pointer';
          btn.href = '${baseUrl}/functions/v1/verify-key-link?token=${linkData.token}&complete=true';
        }
      }
    </script>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — DefendLua</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e; color: #e0e0e0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
    }
    .container {
      max-width: 500px; width: 90%; padding: 40px;
      background: #16213e; border-radius: 16px;
      border: 1px solid #0f3460; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      text-align: center;
    }
    h1 { font-size: 22px; margin-bottom: 16px; color: ${isError ? '#ff6b6b' : '#5865F2'}; }
    .message { color: #aaa; line-height: 1.6; white-space: pre-line; }
    .logo { font-size: 32px; margin-bottom: 20px; }
    .warning { 
      margin-top: 20px; padding: 12px; background: rgba(255,107,107,0.1); 
      border: 1px solid rgba(255,107,107,0.3); border-radius: 8px;
      color: #ff6b6b; font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🛡️</div>
    <h1>${title}</h1>
    <p class="message">${message}</p>
    ${linkSection}
    ${!isError && linkData ? '<div class="warning">⚠️ Attempting to bypass verification will result in no key being generated. Complete the full task to receive your key.</div>' : ''}
  </div>
</body>
</html>`;
}
