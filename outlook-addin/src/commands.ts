// Office Add-in commands file
// This file handles any command-based actions (currently not used)

Office.onReady(() => {
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
