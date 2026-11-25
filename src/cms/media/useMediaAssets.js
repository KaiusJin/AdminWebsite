import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { loadMediaAssets } from "./mediaApi";

export default function useMediaAssets(revision = 0) {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    loadMediaAssets(supabase, abort.signal)
      .then((items) => {
        if (active) {
          setAssets(items);
          setError("");
        }
      })
      .catch((reason) => {
        if (active) {
          setAssets([]);
          setError(reason.message);
        }
      });
    return () => {
      active = false;
      abort.abort();
    };
  }, [revision]);
  return { assets, error };
}
