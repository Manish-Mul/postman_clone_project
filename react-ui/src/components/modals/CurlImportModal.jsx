import { useEffect } from "react";
import { WorkspacesContext } from "../../contexts/Workspaces";
import { useState, useContext } from "react";
import api from "../../api";
import { Context } from "../../contexts/Store";

export default function CurlImportModal() {
  const { state, dispatch } = useContext(Context);
  const { currentWorkspaceId } = useContext(WorkspacesContext);
  const [curl, setCurl] = useState("");

  useEffect(() => {
    if (state.showCurlModal) setCurl("");
  }, [state.showCurlModal]);

  useEffect(() => {
    setCurl("");
  }, [currentWorkspaceId]);

  if (!state.showCurlModal) return null;

  const normalizeCurl = (curl) => {
  return curl
    .replace(/\\\n/g, " ")   // remove line continuations
    .replace(/\n/g, " ")     // remove newlines
    .replace(/\s+/g, " ")    // normalize spaces
    .trim();
};

const handleImport = async () => {
  try {
    const cleanedCurl = normalizeCurl(curl);

    const res = await api.post("/api/parse-curl", { curl: cleanedCurl });

    dispatch({ type: "SET_CURL_PARSED", payload: res.data });
    dispatch({ type: "CLOSE_CURL_MODAL" });
  } catch {
    alert("Invalid curl");
  }
};


  return (
  <div className="modal-overlay" onClick={() => dispatch({ type: "CLOSE_CURL_MODAL" })}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <h3>Import Curl</h3>
      <textarea
        rows={6}
        value={curl}
        onChange={e => setCurl(e.target.value)}
        style={{ width: "100%" }}
      />
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <button onClick={handleImport}>Import</button>
        <button onClick={() => dispatch({ type: "CLOSE_CURL_MODAL" })}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

}
