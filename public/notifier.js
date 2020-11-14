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
  Toastify({
  text: body,
  duration: 5000, 
  close: true,
  gravity: "top", // `top` or `bottom`
  position: 'right', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, #10561F, #256F15)",
  stopOnFocus: true, // Prevents dismissing of toast on hover
}).showToast();
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
  Toastify({
  text: body,
  duration: 5000, 
  close: true,
  gravity: "top", // `top` or `bottom`
  position: 'right', // `left`, `center` or `right`
  backgroundColor: "linear-gradient(to right, #FE7914, #FFDD55)",
  stopOnFocus: true, // Prevents dismissing of toast on hover
}).showToast();
}

/**
 * Asks the user permission for using notifications.
 */
function askNotificationPermission() {
  Notification.requestPermission();
}
