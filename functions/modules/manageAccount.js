const { firestore } = require("firebase-admin");
const admin = require("firebase-admin");
const { user } = require("firebase-functions/lib/providers/auth");
const db = admin.firestore();

module.exports.deleteAccount = async function (user) {
    let uid = user.uid;

    //delete the own settings
    db.collection("userdata").doc(uid).delete()

    //delete me at other accounts
    let docs = await db.collection("userdata").where('friends', "array-contains", uid).get();
    docs.docs.forEach(async (doc) => {
        doc.ref.update({ "friends": firestore.FieldValue.arrayRemove(uid) })
    })


}

module.exports.createAccount = async function (user) {
    let uid = user.uid;
    db.collection("userdata").doc(uid).update({ "lastNotification": [] })
}

module.exports.manageAdmins = async function (change, context) {
    const newValue = change.after.data().admins;

    const previousValue = change.before.data().admins;

    let dataAdd = newValue.filter(x => !previousValue.includes(x));
    let dataDelete = previousValue.filter(x => !newValue.includes(x));
    try {
        if (dataAdd.length > 0) {
            await admin.auth().setCustomUserClaims(dataAdd[0], { "admin": true })
            return console.log(dataAdd + " ist jetzt admin")
        } else if (dataDelete.length > 0) {
            await admin.auth().setCustomUserClaims(dataDelete[0], { "admin": false })
            return console.log(dataDelete + " ist kein admin mehr")
        }
    } catch (error) {
        if (dataAdd.length > 0)
            return console.log("Fehler! Vermutlich existiert Nutzer '" + dataAdd + "' nicht");
        else
            return console.log("Fehler! Vermutlich existiert Nutzer '" + dataDelete + "' nicht");
    }

}