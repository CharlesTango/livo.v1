// Office Add-in commands file
// This file handles any command-based actions (currently not used)

Office.onReady(() => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'outlook-addin/src/commands.ts:5',message:'Commands Office.onReady',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  // Commands ready
});

// Placeholder for future command functions
function showNotification(message: string) {
  Office.context.mailbox.item?.notificationMessages.addAsync("livo-notification", {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: message,
    icon: "Icon.16x16",
    persistent: false,
  });
}

// Make function available globally for Office.js
(globalThis as any).showNotification = showNotification;
