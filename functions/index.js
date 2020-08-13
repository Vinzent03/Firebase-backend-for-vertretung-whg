//use firebase emulators:export ../data to export the firestore data

const functions = require('firebase-functions');
var admin = require("firebase-admin");

admin.initializeApp({
  //uncomment following for emulator:

  //credential: admin.credential.cert(require("./vertretung-cred.json")),
  //databaseURL: "https://vertretung-b5742.firebaseio.com"
});

const friends = require("./modules/friends")
const manageAccount = require("./modules/manageAccount")
const notifications = require("./modules/notificatons")
const news = require("./modules/news")

//friends
exports.addFriendRequest = functions.region("europe-west3").https.onCall(async (data, context) => {
  return friends.addFriendRequest(data, context)
});

exports.acceptFriendRequest = functions.region("europe-west3").https.onCall(async (data, context) => {
  return friends.acceptFriendRequest(data, context)
});

exports.declineFriendRequest = functions.region("europe-west3").https.onCall(async (data, context) => {
  return friends.declineFriendRequest(data, context)
});

//account
exports.deleteAccount = functions.region("europe-west3").auth.user().onDelete((user) => {
  return manageAccount.deleteAccount(user)
})

exports.createAccount = functions.region("europe-west3").auth.user().onCreate((user) => {
  return manageAccount.createAccount(user)
})

exports.manageAdmins = functions.region("europe-west3").firestore.document("details/admins").onUpdate(async (change, context) => {
  return await manageAccount.manageAdmins(change, context)
})

//notification
exports.sendNotification = functions.region("europe-west3").https.onRequest(async (req, res) => {
  return res.send(await notifications.sendNotification(req, res))
});

// exports.test = functions.region("europe-west3").https.onRequest(async (req, res) => {
//   var message = {
//     notification: {
//       title: "Freundesanfrage",
//       body: "sorry",
//     }, data: {
//       reason: "friendRequest",
//       click_action:"FLUTTER_NOTIFICATION_CLICK"
//     }
//   };
//   admin.messaging().sendToDevice("cuBHdaSjRse_IERYr1tVbJ:APA91bHTvADpDiOdyPPB629cXvTMm7N6ZVzs_BDbGDaC9f2o0xSttC-E8AzQejzeXKuF7YgKKN8ZazBlKiGiBN6-ITFvaRmYTeOLG5qyEcDC0qMDktXwsOHMQMXtuTo9ZhfuemrGrL_x",message)
// });

//news
exports.addNews = functions.region("europe-west3").https.onCall(async (data, context) => {
  return news.addNews(data, context)
})

exports.deleteNews = functions.region("europe-west3").https.onCall(async (data, context) => {
  return news.deleteNews(data, context)
})

exports.editNews = functions.region("europe-west3").https.onCall(async (data, context) => {
  return news.editNews(data, context)
})