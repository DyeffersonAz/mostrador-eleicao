/* eslint-disable no-unused-vars */
/**
 * Notifies the user of an election.
 * @param {String} title - Title of the notification.
 * @param {String} body - Body of the notification.
 */
async function notifyElection(title, body) {
  if (Notification.permission === 'default') {
    askNotificationPermission();
  }
  const img = 'images/party.png';
  new Notification(title, {body: body, icon: img});
}

/**
* Notifies the user of a mathematical election.
* @param {String} title - Title of the notification.
* @param {String} body - Body of the notification.
*/
async function notifyMatematicamente(title, body) {
  if (Notification.permission === 'default') {
    askNotificationPermission();
  }
  const img = 'images/warning.png';
  new Notification(title, {body: body, icon: img});
}

/**
 * Asks the user permission for using notifications.
 */
function askNotificationPermission() {
  Notification.requestPermission();
}
