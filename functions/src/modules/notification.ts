import { auth, firestore, messaging } from "firebase-admin";
import { logger } from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { fetchData } from "./fetchData";
import { checker } from "./filter";

export interface dsbMobileData {
    lastChange: string,
    dayNames: string[],
    mainDataToday: string[],
    mainDataTomorrow: string[];
}
async function updateFirestore(data: dsbMobileData) {
    firestore().collection("details").doc("webapp").update(
        {
            "lastChange": data.lastChange,
            "substituteToday": data.mainDataToday,
            "substituteTomorrow": data.mainDataTomorrow,
            "dayNames": data.dayNames,
        });
}
function getDataForNotification(data: dsbMobileData) {
    return {
        "rawSubstituteToday": data.mainDataToday.join("||"),
        "rawSubstituteTomorrow": data.mainDataTomorrow.join("||"),
        "lastChange": data.lastChange,
        "dayNames": data.dayNames.join("||"),
    };
}

function getDateString() {
    let date = new Date();
    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
}

async function notificationOnChange(substitute: string[], doc: DocumentSnapshot, notificationData: any) {
    let isNew = false;
    if (doc.data()?.lastNotification.toString() === substitute.toString()) {
        return;
    }
    let formattedLastNotification: string[] = [];
    let formattedSubstitute: string[] = [];

    doc.data()?.lastNotification.forEach((lastNotification: string) => {
        if (lastNotification.includes("Std."))
            lastNotification = lastNotification.substring(lastNotification.indexOf("Std.") + 5);
        formattedLastNotification.push(lastNotification);
    });
    substitute.forEach(newSubs => {
        if (newSubs.includes("Std."))
            newSubs = newSubs.substring(newSubs.indexOf("Std.") + 5);
        formattedSubstitute.push(newSubs);
    });


    formattedSubstitute.forEach((newSubs) => {
        if (!formattedLastNotification.includes(newSubs)) {
            isNew = true;
        }
    });

    var message = {
        notification: {
            title: "Neue Vertretung",
            body: substitute.join("\n"),
            tag: getDateString(),
        },
        data: notificationData,
    };
    try {
        if (isNew) {
            await messaging().sendToDevice(doc.data()?.token, message);
            logger.log(doc.data()?.name + " alte Vertretung:" + doc.data()?.lastNotification + "XXX" + substitute);
        }
        doc.ref.update({
            "lastNotification": substitute,
        });
    } catch (err) {
        let users = await auth().listUsers();
        if (err.code === "messaging/registration-token-not-registered") {
            users.users.forEach(async (user) => {
                if (user.uid === doc.id) {
                    if ((await auth().getUser(doc.id)).email === undefined) {
                        return await auth().deleteUser(user.uid);
                    }
                }
            });
        } else {
            throw err;
        }
    }
}

async function notificationOnFirstChange(substitute: string[], doc: DocumentSnapshot, notificationData: any) {
    if (!doc.data()?.notificationOnFirstChange)
        return;
    let message;
    if (substitute.length > 0)
        message = {
            notification: {
                title: "Der Plan wurde aktualisiert",
                body: substitute.join("\n"),
            },
            data: notificationData
        };
    else
        message = {
            notification: {
                title: "Der Plan wurde aktualisiert",
                body: "Du hast leider keine Vertretung",
            },
        };
    try {
        await messaging().sendToDevice(doc.data()?.token, message);
        logger.log(doc.data()?.name + message.notification.title + message.notification.body);
        doc.ref.update({
            "lastNotification": substitute,
        });
    } catch (err) {
        let users = await auth().listUsers();
        if (err.code === "messaging/registration-token-not-registered") {
            users.users.forEach(async (user) => {
                if (user.uid === doc.id) {
                    if ((await auth().getUser(doc.id)).email === undefined) {
                        return await auth().deleteUser(user.uid);
                    }
                }
            });
        } else {
            throw err;
        }
    }
}

export async function sendNotification() {
    const data = await fetchData();

    updateFirestore(data);

    let sendNotificationOnFirstChange: boolean;
    let lastChange = data.lastChange.toString().substring(28);
    if (lastChange === "00:09") {
        await firestore().collection("details").doc("cloudFunctions").update({ "alreadySendNotificationOnFirstChange": false });
        sendNotificationOnFirstChange = false;
    } else {
        sendNotificationOnFirstChange = !(await firestore().collection("details").doc("cloudFunctions").get()).data()?.alreadySendNotificationOnFirstChange;
        await firestore().collection("details").doc("cloudFunctions").update({ "alreadySendNotificationOnFirstChange": true });
    }

    (await firestore().collection("userdata").get()).forEach(async doc => {
        let substitute = checker(doc.data().schoolClass, data.mainDataToday, doc.data().subjects, doc.data().subjectsNot, doc.data().personalSubstitute);

        if (doc.data().notificationOnFirstChange && sendNotificationOnFirstChange)
            return await notificationOnFirstChange(substitute, doc, getDataForNotification(data));
        if (doc.data().notification === false)
            return;
        if (substitute.length === 0)
            return;
        return await notificationOnChange(substitute, doc, getDataForNotification(data));
    });
}