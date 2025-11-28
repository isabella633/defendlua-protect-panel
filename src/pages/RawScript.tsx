import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const RawScript = () => {
  const { scriptId } = useParams();
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScript = async () => {
      if (!scriptId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("scripts")
          .select("script_key")
          .eq("id", scriptId)
          .single();

        if (error || !data) {
          console.error("Script not found:", error);
          setScript(null);
        } else {
          setScript(data.script_key);
        }
      } catch (err) {
        console.error("Error fetching script:", err);
        setScript(null);
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [scriptId]);

  if (loading) {
    return (
      <pre style={{ margin: 0, padding: "1rem", fontFamily: "monospace" }}>
        -- Loading script...
      </pre>
    );
  }

  if (!script) {
    return (
      <pre style={{ margin: 0, padding: "1rem", fontFamily: "monospace" }}>
        -- Error: Script not found
      </pre>
    );
  }

  return (
    <pre style={{ margin: 0, padding: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      {script}
    </pre>
  );
};

export default RawScript;
