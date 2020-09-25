const admin = require("firebase-admin");
const db = admin.firestore();

module.exports.sendNotification = async function (req, res) {
    function getSubstitute(doc) {
        return require("./filter").checker(doc.data().schoolClass, req.query.substitute, doc.data().subjects, doc.data().subjectsNot, doc.data().personalSubstitute);
    }
    let sendNotificationOnFirstChange
    let lastChange = req.query.lastChange.substring(28)
    if (lastChange === "00:09") {
        await db.collection("details").doc("cloudFunctions").update({ "alreadySendNotificationOnFirstChange": false })
        sendNotificationOnFirstChange = false;
    }
    else {
        sendNotificationOnFirstChange = !(await db.collection("details").doc("cloudFunctions").get()).data().alreadySendNotificationOnFirstChange
        await db.collection("details").doc("cloudFunctions").update({ "alreadySendNotificationOnFirstChange": true })
    }
    return db.collection("userdata").get().then(snapshot => {
        return snapshot.forEach(async doc => {
            let substitute = getSubstitute(doc);

            if (doc.data().notificationOnFirstChange && sendNotificationOnFirstChange)
                return await notificationOnFirstChange(substitute, doc);
            if (doc.data().notification === false)
                return
            if (substitute.length === 0)
                return
            return await notificationOnChange(substitute, doc)
        })
    });
}
async function notificationOnChange(substitute, doc) {
    let isNew = false;
    if (doc.data().lastNotification.toString() === substitute.toString()) {
        return
    }
    let formattedLastNotification = [];
    let formattedSubstitute = [];
    doc.data().lastNotification.forEach(lastNotification => {
        if (lastNotification.includes("Std."))
            lastNotification = lastNotification.substring(lastNotification.indexOf("Std.") + 5);
        formattedLastNotification.push(lastNotification);
    });
    substitute.forEach(newSubs => {
        if (newSubs.includes("Std."))
            newSubs = newSubs.substring(newSubs.indexOf("Std.") + 5)
        formattedSubstitute.push(newSubs);
    });


    formattedSubstitute.forEach((newSubs) => {
        if (!formattedLastNotification.includes(newSubs)) {
            isNew = true;
        }
    })

    var message = {
        notification: {
            title: "Neue Vertretung",
            body: "-" + substitute.join("\n-"),
        },
    };
    try {
        if (isNew) {
            await admin.messaging().sendToDevice(doc.data().token, message);
            console.log(doc.data().name +" alte Vertretung:"+ doc.data().lastNotification + "XXX"+substitute+(doc.data().lastNotification.toString() === substitute.toString()).toString());
        }
        doc.ref.update({
            "lastNotification": substitute,
        })
    } catch (err) {
        let users = await admin.auth().listUsers();
        if (err.code === "messaging/registration-token-not-registered") {
            users.users.forEach(async (user) => {
                if (user.uid === doc.id) {
                    if ((await admin.auth().getUser(doc.id)).email === undefined) {
                        return await admin.auth().deleteUser(user.uid)
                    }
                }
            })
        } else {
            throw err;
        }
    }
}

async function notificationOnFirstChange(substitute, doc) {
    if (!doc.data().notificationOnFirstChange)
        return
    let message
    if (substitute.length > 0)
        message = {
            notification: {
                title: "Der Plan wurde aktualisiert",
                body: "-" + substitute.join("\n-"),
            },
        };
    else
        message = {
            notification: {
                title: "Der Plan wurde aktualisiert",
                body: "Du hast leider keine Vertretung",
            },
        };
    try {
        await admin.messaging().sendToDevice(doc.data().token, message);
        console.log(doc.data().name + message.notification.title + message.notification.body);
        doc.ref.update({
            "lastNotification": substitute,
        })
    } catch (err) {
        let users = await admin.auth().listUsers();
        if (err.code === "messaging/registration-token-not-registered") {
            users.users.forEach(async (user) => {
                if (user.uid === doc.id) {
                    if ((await admin.auth().getUser(doc.id)).email === undefined) {
                        return await admin.auth().deleteUser(user.uid)
                    }
                }
            })
        } else {
            throw err;
        }
    }
}