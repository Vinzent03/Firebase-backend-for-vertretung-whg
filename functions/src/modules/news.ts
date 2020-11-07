import { auth, firestore, messaging } from "firebase-admin";
import { CallableContext } from "firebase-functions/lib/providers/https";

interface message {
    "title": string,
    "text": string,
    "lastEdited": string
}
function getDateString() {
    let date = new Date()
    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
}
export async function addNews(data: any, context: CallableContext) {
    let user = await auth().getUser(context.auth?.uid ?? "Not found");
    if (user.customClaims?.["admin"] === true) {
        let news: message[] = (await firestore().collection("news").doc("news").get()).data()?.news
        news.splice(0, 0, { "title": data.newNews["title"], "text": data.newNews["text"], "lastEdited": getDateString() })
        await firestore().collection("news").doc("news").set({ "news": news })

        let message = {
            notification: {
                title: "Neue Nachricht",
                body: "Es gibt eine neue Nachricht, die vielleicht wichtig ist.",
            },
        };
        if (data.sendNotification === true)
            await messaging().sendToTopic("all", message);
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }
    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin! Eigentlich solltest du gar nicht hierhin kommen!" }
    }
}

export async function deleteNews(data: any, context: CallableContext) {
    let user = await auth().getUser(context.auth?.uid ?? "Not found");

    if (user.customClaims?.['admin'] === true) {
        let snap = await firestore().collection("news").doc("news").get()
        let news: message[] = snap.data()?.news
        news.splice(data.index, 1)
        await firestore().collection("news").doc("news").set({ "news": news })
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }
    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin, bitte melde dich ab und dann wieder an. Wenn du denkst du solltest Admin sein, melde dich bitte bei mir." }
    }
}

export async function editNews(data: any, context: CallableContext) {
    let user = await auth().getUser(context.auth?.uid ?? "Not found");
    if (user.customClaims?.['admin']) {
        let snap = await firestore().collection("news").doc("news").get()
        let news: message[] = snap.data()?.news
        news.splice(data.index, 1, { "title": data.newNews["title"], "text": data.newNews["text"], "lastEdited": getDateString() })
        await firestore().collection("news").doc("news").set({ "news": news })

        var message = {
            notification: {
                title: "Eine Nachricht wurde bearbeitet",
                body: "Diese Änderungen könnten wichtig sein.",
            },
        };

        if (data.sendNotification === true)
            await messaging().sendToTopic("all", message);
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }

    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin, bitte melde dich ab und dann wieder an. Wenn du denkst du solltest Admin sein, melde dich bitte bei mir." }
    }
}
