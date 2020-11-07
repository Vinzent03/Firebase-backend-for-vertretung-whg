import { initializeApp } from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as friends from "./modules/friends";
import * as manageAccount from "./modules/manageAccount";
import * as news from "./modules/news";
import * as notificatíon from "./modules/notification";

initializeApp();

export const addFriend = functions.region("europe-west3").https.onCall(async (data, context) => {
    return await friends.addFriend(data, context);
});

export const deleteAccount = functions.region("europe-west3").auth.user().onDelete(async (user, context) => {
    return await manageAccount.deleteAccount(user, context);
});

export const createAccount = functions.region("europe-west3").auth.user().onCreate(async (user, context) => {
    return await manageAccount.createAccount(user, context);
});

export const manageAdmins = functions.region("europe-west3").firestore.document("details/admins").onUpdate(async (change, context) => {
    return await manageAccount.manageAdmins(change, context);
});

export const sendNotification = functions.region("europe-west3").https.onRequest(async (req, resp) => {
    resp.send(await notificatíon.sendNotification(req));
});

export const addNews = functions.region("europe-west3").https.onCall(async (data, context) => {
    return await news.addNews(data, context);
});

export const editNews = functions.region("europe-west3").https.onCall(async (data, context) => {
    return await news.editNews(data, context);
});

export const deleteNews = functions.region("europe-west3").https.onCall(async (data, context) => {
    return await news.deleteNews(data, context);
});

