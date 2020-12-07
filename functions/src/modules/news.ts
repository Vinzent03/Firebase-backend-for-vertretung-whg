import { auth, firestore, messaging } from "firebase-admin";
import { CallableContext } from "firebase-functions/lib/providers/https";

function getDateString() {
    let date = new Date()
    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
}

async function getTokens(schoolClasses: string[]): Promise<string[]> {
    let tokens: string[];
    tokens = []
    let docs = await firestore().collection("userdata").where("schoolClass", "in", schoolClasses).get()
    docs.docs.forEach((doc) => {
        if (doc.data().token)
            tokens.push(doc.data().token)
    })
    console.log(tokens);

    return tokens;
}

export async function addNews(data: any, context: CallableContext) {
    let user = await auth().getUser(context.auth?.uid ?? "Not found");
    if (user.customClaims?.["admin"] === true) {
        await firestore().collection("news").add({
            "title": data.title,
            "text": data.text,
            "schoolClasses": data.schoolClasses,
            "lastEdited": getDateString(),
            "created": firestore.Timestamp.now()
        })

        let message = {
            notification: {
                title: "Neue Nachricht",
                body: data.title,
            },
        };
        if (data.sendNotification === true)
            await messaging().sendToDevice(await getTokens(data.schoolClasses), message);
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }
    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin! Eigentlich solltest du gar nicht hierhin kommen!" }
    }
}

export async function deleteNews(data: any, context: CallableContext) {
    let user = await auth().getUser(context.auth?.uid ?? "Not found");

    if (user.customClaims?.['admin'] === true) {
        await firestore().collection("news").doc(data.id).delete();
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }
    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin, bitte melde dich ab und dann wieder an. Wenn du denkst du solltest Admin sein, melde dich bitte bei mir." }
    }
}

export async function editNews(data: any, context: CallableContext) {
    let user = await auth().getUser(context.auth?.uid ?? "Not found");
    if (user.customClaims?.['admin'] === true) {
        await firestore().collection("news").doc(data.id).update({
            "text": data.text,
            "title": data.title,
            "lastEdited": getDateString(),
        })
        let schoolClasses = (await firestore().collection("news").doc(data.id).get()).data()?.schoolClasses ?? [];

        const payload: messaging.MessagingPayload = {
            notification: {
                title: "Eine Nachricht wurde bearbeitet",
                body: data.title,
            },
        }
        if (data.sendNotification === true)
            await messaging().sendToDevice(await getTokens(schoolClasses), payload);
        return { "code": "SUCCESS", "message": "Nachricht wurde gesendet" }

    } else {
        return { "code": "ERROR_NOT_ADMIN", "message": "Du bist kein Admin, bitte melde dich ab und dann wieder an. Wenn du denkst du solltest Admin sein, melde dich bitte bei mir." }
    }
}
