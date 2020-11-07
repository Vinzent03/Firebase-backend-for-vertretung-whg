import { auth, firestore } from "firebase-admin";
import { Change, EventContext, logger } from "firebase-functions";
import { UserRecord } from "firebase-functions/lib/providers/auth";
import { QueryDocumentSnapshot } from "firebase-functions/lib/providers/firestore";

export async function deleteAccount(user: UserRecord, context: EventContext) {
    await firestore().collection("userdata").doc(user.uid).delete();

    let docs = await firestore().collection("userdata").where('friends', "array-contains", user.uid).get();
    docs.docs.forEach(async (doc) => {
        doc.ref.update({ "friends": firestore.FieldValue.arrayRemove(user.uid) })
    });
}

export async function createAccount(user: UserRecord, context: EventContext) {
    firestore().collection("userdata").doc(user.uid).update({ "lastNotification": [] })
}

export async function manageAdmins(change: Change<QueryDocumentSnapshot>, context: EventContext) {
    const newValue: string[] = change.after.data().admins;

    const previousValue: string[] = change.before.data().admins;

    let dataAdd = newValue.filter(x => !previousValue.includes(x));
    let dataDelete = previousValue.filter(x => !newValue.includes(x));
    try {
        if (dataAdd.length > 0) {
            await auth().setCustomUserClaims(dataAdd[0], { "admin": true })
            return logger.info(dataAdd + " ist jetzt admin")
        } else if (dataDelete.length > 0) {
            await auth().setCustomUserClaims(dataDelete[0], { "admin": false })
            return logger.info(dataDelete + " ist kein admin mehr")
        }
    } catch (error) {
        if (dataAdd.length > 0)
            return logger.info("Fehler! Vermutlich existiert Nutzer '" + dataAdd + "' nicht");
        else
            return logger.info("Fehler! Vermutlich existiert Nutzer '" + dataDelete + "' nicht");
    }
}