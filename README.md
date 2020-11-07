# Firebase settings and cloud functions for my Flutter app [vertretung_whg](https://github.com/Vinzent03/vertretung_whg)

# Getting started
1. Follow this [guide](https://firebase.google.com/docs/functions/get-started)
2. Edit `filter.js` as in [vertretung_whg](https://github.com/Vinzent03/vertretung_whg) and `notification.js`
3. run `firebase deploy`

# Notifications
To send Notifications, call the function `sendNotification` frequently. In my case each item is separated with `||`

# Admins
An admin can add, edit and delete news. To make a user admin, 
the uid must be added to the `admins` list in `details/admins`. In addition the user must be logged in with email.

# Firestore structure
scheme:
```
.
└── collection
   └── document
       └── field <dataType>
           └── field in map <dataType>
```

```
.
├── details
│   ├── admins
│   │   └── admins <List<String(userUID)>>
│   ├── links
│   │   ├── changelogLink <String>
│   │   ├── apkDownload <String>
│   │   └── downloadLink <String>
│   ├── webapp
│   │   ├── lastChange <String>
│   │   ├── substituteToday <List<String>>
│   │   └── substituteTomorrow <List<String>>
│   ├── cloudFunctions
│   │   └── alreadySendNotificationOnFirstChange <bool>
│   └── versions
│       ├── forceUpdate <bool>
│       ├── message <List<String>>
│       └── newVersion <String>
│
├── news
│   └── news
│       └── news <List<Map>>
│           ├── text <String>
│           ├── lastEdited <String>
│           └── title <String>
│
│
└── userdata
    └── <userUID>
        ├── lastNotification <String>
        ├── friends <List<String>>
        ├── freeLessons <List<String>>
        ├── name <String>
        ├── notification <bool>
        ├── notificationOnFirstChange <bool>
        ├── personalSubstitute <bool>
        ├── schoolClass <String>
        ├── subjects <List<String>>
        ├── subjectsCustom <List<String>>
        ├── subjectsNot <List<String>>
        ├── subjectsNotCustom <List<String>>
        └── token <String>
```