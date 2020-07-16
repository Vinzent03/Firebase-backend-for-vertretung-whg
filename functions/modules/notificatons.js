const admin = require("firebase-admin");
const db = admin.firestore();

module.exports.sendNotification = async function (req, res) {
    function getSubstitute(doc) {
        return require("./filter").checker(doc.data().schoolClass, req.query.data, doc.data().subjects, doc.data().subjectsNot, doc.data().personalSubstitute);
    }
    return db.collection("userdata").get().then(snapshot => {
        return snapshot.forEach(async doc => {
            if (doc.data().notification) {
                var vertretung = getSubstitute(doc).toString()
                if (vertretung.length > 0) {
                    if (doc.data().lastNotification === vertretung) {
                        return
                    }
                    var message = {
                        notification: {
                            title: "Neue Vertretung",
                            body: vertretung,
                        },
                        token: doc.data().token,
                    };
                    try {
                        let response = await admin.messaging().send(message);
                        return doc.ref.update({
                            "lastNotification": vertretung,
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