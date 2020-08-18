const admin = require("firebase-admin");
const { firestore } = require("firebase-admin");
const db = admin.firestore();

module.exports.addFriend = async function (data, context) {
  let shortFriendUid = data.friendUid;
  let uid = context.auth.uid;
  let fullFriendUid;
  let token;
  //get full uid of friend
  let ref1 = await db.collection("userdata").get().then(snapshot => {
    return snapshot.forEach(async doc => {
      if (doc.id.substring(0, 6).includes(shortFriendUid)) {
        fullFriendUid = doc.id;
        token = doc.data().token.toString();
        return;
      }
    })
  })

  if (token === undefined) {
    return { "code": "EXCEPTION_CANT_FIND_FRIEND", "message": "Diesen Benutzer gibt es nicht" }
  }

  let friendsDocRef = db.collection("userdata").doc(fullFriendUid);
  let userDocRef = db.collection("userdata").doc(uid);
  friendsDocRef.update({ "friends": firestore.FieldValue.arrayUnion(uid) })
  let userDoc = await userDocRef.get();
  let name = userDoc.data().name;

  var message = {
    notification: {
      title: name + " ist jetzt dein Freund",
      body: "Klicke hier um dein Freundesliste zu sehen."
    },
    data: {
      reason: "friendAdd",
      click_action: "FLUTTER_NOTIFICATION_CLICK"
    }
  }

  admin.messaging().sendToDevice(token, message)
  if (data.addFriendToYourself === "true") {
    db.collection("userdata").doc(uid).update({ "friends": firestore.FieldValue.arrayUnion(fullFriendUid) })
  }

  return { "code": "SUCCESS", "message": "Anfrage geschickt" }
}