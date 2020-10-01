function notify(title, body) {
    if (!("Notification" in window)) {
        alert(`${title}\n${body}`);
        return;
    }
    
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else if (Notification.permission === "granted") {
        let notification = new Notification(title, {
            body: body,
            icon: "images/party.png"
        })
    }
}
