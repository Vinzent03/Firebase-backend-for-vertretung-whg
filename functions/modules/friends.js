const admin = require("firebase-admin");
const db = admin.firestore();

module.exports.addFriendRequest = async function (data, context) {
  // in der Sammlung userFriends im document requests soll dann immer ein neues doc erstellt werden mit value als friends uid
  // außerdem soll pro nutzer eine sammlung von schon vorhandenen freunden sein
  let shortFriendUid = data.frienduid;
  let fullFriendUid = "loading";
  let uid = context.auth.uid;
  let token = null;

  let ref1 = await db.collection("userdata").get().then(snapshot => {
    return snapshot.forEach(async doc => {
      if (doc.id.substring(0, 6).includes(shortFriendUid)) {
        fullFriendUid = doc.id;
        token = doc.data().token.toString();
        return;
      }
    })
  })
  if (token === null) {
    return { "code": "EXCEPTION_CANT_FIND_FRIEND", "message": "Diesen Benutzer gibt es nicht" }
  }

  let friendsDocRef = db.collection("userFriends").doc(fullFriendUid);
  let friendsDoc = await friendsDocRef.get();

  if (friendsDoc.data().requests.includes(uid)) {
    return { "code": "EXCEPTION_ALREADY_REQUESTED", "message": "Bereits Anfrage gesendet" }
  }

  let usersDoc = await db.collection("userFriends").doc(uid).get()
  if (usersDoc.data().friends.includes(fullFriendUid)) {
    return { "code": "EXCEPTION_ALREADY_FRIEND", "message": "Bereits in der Freundesliste" }
  }

  let friendsList = friendsDoc.data().friends;
  friendsList.push(uid);
  friendsDocRef.update({ "requests": friendsList });

  var message = {
    notification: {
      title: "Freundesanfrage",
      body: "Klicke hier",
    },
    token: token,
  };
  let response = await admin.messaging().send(message);

  console.log(uid + "macht anfrage an" + fullFriendUid);
  return { "code": "SUCCESS", "message": "Anfrage geschickt" }
}

module.exports.acceptFriendRequest = async function (data, context) {
  // in der Sammlung userFriends im document requests soll dann immer ein neues doc erstellt werden mit value als friends uid
  // außerdem soll pro nutzer eine sammlung von schon vorhandenen freunden sein
  let frienduid = data.frienduid;
  let uid = context.auth.uid;
  let name;


  //request deleten
  let usersDocRef = db.collection("userFriends").doc(uid);
  let usersDoc = await usersDocRef.get();
  let requests = usersDoc.data().requests;

  const index = requests.indexOf(frienduid);
  requests.splice(index, 1);

  usersDocRef.update({ "requests": requests });


  let friendsDocRef = await db.collection("userFriends").doc(frienduid);
  let friendsDoc = await friendsDocRef.get();
  let friends = friendsDoc.data().friends;

  friends.push(uid);
  friendsDocRef.update(
    {
      "friends": friends,
    }
  )
}

module.exports.declineFriendRequest = async function (data, context) {
  let frienduid = data.frienduid;
  let uid = context.auth.uid;

  let usersDocRef = db.collection("userFriends").doc(uid);
  let usersDoc = await usersDocRef.get()
  let requests = usersDoc.data().requests

  const index = requests.indexOf(frienduid);
  requests.splice(index, 1);

  usersDocRef.update({ "requests": requests });
}