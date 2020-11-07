import { auth, firestore, messaging } from "firebase-admin";
import { CallableContext } from "firebase-functions/lib/providers/https";

export async function addFriend(data: any, context: CallableContext) {
    const shortFriendUid = data.friendUid;
    const uid = context.auth?.uid ?? "Not found";
    let fullFriendUid: string | undefined;
    let token: string | undefined;
    let friendFound = false;
    let friendDocRef: firestore.DocumentReference;
    const userDocRef = firestore().collection("userdata").doc(uid);

    let users = await auth().listUsers();
    for (const user of users.users) {
        if (user.uid.startsWith(shortFriendUid)) {
            friendFound = true;
            fullFriendUid = user.uid;
            friendDocRef = firestore().collection("userdata").doc(fullFriendUid);
            token = (await friendDocRef.get()).data()?.token;
            friendDocRef.update({ "friends": firestore.FieldValue.arrayUnion(uid) })
        }
    }
    if (!friendFound)
        return { "code": "EXCEPTION_CANT_FIND_FRIEND", "message": "Diesen Benutzer gibt es nicht" }
    let name = (await userDocRef.get()).data()?.name ?? "Not found"

    let message = {
        notification: {
            title: name + " ist jetzt Dein Freund",
            body: "Klicke hier um Deine Freundesliste zu sehen."
        },
        data: {
            reason: "friendAdd",
            click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
    }

    if (token !== undefined) {
        messaging().sendToDevice(token, message);
    }
    if (data.addFriendToYourself === "true") {
        userDocRef.update({ "friends": firestore.FieldValue.arrayUnion(fullFriendUid) })
    }    
    return { "code": "SUCCESS", "message": "Anfrage geschickt" }
}