const admin = require("firebase-admin");
const db = admin.firestore();


function getDateString() {
    let date = new Date()
    return dateString = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
}


module.exports.addNews = async function (data, context) {
    let user = await admin.auth().getUser(context.auth.uid);
    if (user.customClaims['admin']) {
        let snap = await db.collection("news").doc("news").get()
        let news = snap.data().news
        news.splice(0, 0, { "title": data.newNews["title"], "text": data.newNews["text"], "lastEdited": getDateString() })
        let res = await db.collection("news").doc("news").set({ "news": news })

        var message = {
            notification: {
                title: "Neue Nachricht",
                body: "Es gibt eine neue Nachricht, die vielleicht wichtig ist.",
            },
        };
        if (data.sendNotification)
            await admin.messaging().sendToTopic("all", message);
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }

    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin! Eigentlich solltest du gar nicht hierhin kommen!" }
    }
}
module.exports.deleteNews = async function (data, context) {
    let user = await admin.auth().getUser(context.auth.uid);
    if (user.customClaims['admin']) {
        let snap = await db.collection("news").doc("news").get()
        let news = snap.data().news
        news.splice(data.index, 1)
        let res = await db.collection("news").doc("news").set({ "news": news })
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }

    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin, bitte melde dich ab und dann wieder an. Wenn du denktst du solltest Admin sein, melde dich bitte bei mir." }
    }
}
module.exports.editNews = async function (data, context) {
    let user = await admin.auth().getUser(context.auth.uid);
    if (user.customClaims['admin']) {
        let snap = await db.collection("news").doc("news").get()
        let news = snap.data().news
        news.splice(data.index, 1, { "title": data.newNews["title"], "text": data.newNews["text"], "lastEdited": getDateString() })
        let res = await db.collection("news").doc("news").set({ "news": news })

        var message = {
            notification: {
                title: "Eine Nachricht wurde bearbeitet",
                body: "Diese Änderungen könnten wichtig sein.",
            },
        };
        if (data.sendNotification)
            await admin.messaging().sendToTopic("all", message);
        
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }

    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin, bitte melde dich ab und dann wieder an. Wenn du denktst du solltest Admin sein, melde dich bitte bei mir." }
    }
}
