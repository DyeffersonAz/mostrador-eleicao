async function notifyElection(title, body) {
    if (Notification.permission === "default") {
        askNotificationPermission()
    }
    let img = "images/party.png";
    let notification = new Notification(title, {body: body, icon: img});
}

function askNotificationPermission() {
    Notification.requestPermission();
}