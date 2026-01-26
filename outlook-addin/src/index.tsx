import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/globals.css";

// #region agent log
fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:6',message:'Module loaded',data:{hasOffice:typeof Office !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

window.addEventListener("error", (event) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:10',message:'Window error',data:{message:event.message,filename:event.filename,lineno:event.lineno,colno:event.colno},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
});

window.addEventListener("unhandledrejection", (event) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:16',message:'Unhandled rejection',data:{reason:String(event.reason)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
});

// Initialize Office.js before rendering the React app
Office.onReady((info) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:22',message:'Office.onReady',data:{host:info.host,platform:info.platform},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  if (info.host === Office.HostType.Outlook) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:24',message:'Host is Outlook',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const container = document.getElementById("root");
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:26',message:'Root container lookup',data:{found:!!container},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (container) {
      const root = createRoot(container);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/index.tsx:29',message:'Rendering React app',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }
  }
});
