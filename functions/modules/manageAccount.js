const admin = require("firebase-admin");
const { user } = require("firebase-functions/lib/providers/auth");
const db = admin.firestore();

module.exports.deleteAccount = async function (user) {
    let uid = user.uid;

    //delete the own settings
    db.collection("userdata").doc(uid).delete()

    //delete the own friends and requests
    db.collection("userFriends").doc(uid).delete();

    //delete my requests at other users
    let userFriendsRef = db.collection('userFriends');
    let query = userFriendsRef.where('requests', "array-contains", uid).get()
        .then(snapshot => {
            if (snapshot.empty) {
                return;
            }
            return snapshot.forEach(doc => {
                let requests = doc.data().requests
                const index = requests.indexOf(uid);

                requests.splice(index, 1);
                let usersDocRef = db.collection("userFriends").doc(doc.id);

                usersDocRef.update({ "requests": requests });
            });
        })


}

module.exports.createAccount = async function (user) {
    let uid = user.uid;
    db.collection("userFriends").doc(uid).create(
        {
            "requests": [],
            "friends": []
        });
    db.collection("userdata").doc(uid).update({ "lastNotification": "" })
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