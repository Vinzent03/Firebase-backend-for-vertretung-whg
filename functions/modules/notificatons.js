const admin = require("firebase-admin");
const db = admin.firestore();

module.exports.sendNotification = async function (req, res) {
    function getSubstitute(doc) {
        return require("./filter").checker(doc.data().schoolClass, req.query.data, doc.data().subjects, doc.data().subjectsNot, doc.data().personalSubstitute);
    }
    return db.collection("userdata").get().then(snapshot => {
        return snapshot.forEach(async doc => {
            if (doc.data().notification) {
                var substitute = getSubstitute(doc)
                if (substitute.length > 0) {
                    let isNew = false;
                    if (doc.data().lastNotification.toString() === substitute.toString()) {
                        return
                    }
                    substitute.forEach((newSubs) => {
                        if (!doc.data().lastNotification.includes(newSubs)) {
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
                        if (isNew)
                            await admin.messaging().sendToDevice(doc.data().token, message);
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
                        }
                    }
                }
            }
        })
    });
}