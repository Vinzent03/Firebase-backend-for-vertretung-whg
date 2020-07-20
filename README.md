# Cloud Functions für meine Flutter App [vertretung_whg](https://github.com/Vinzent03/vertretung_whg)

# Eigene Verwendung
1. Das Projekt clonen
2. In den Ordner gehen
3. Der [Anleitung](https://firebase.google.com/docs/functions/get-started) folgen
4. Den Projekt Namen ändern:
    ```Json
    {
        "projects": {
            "default": "vertretung-b5742"
        }
    }
    ```
5. run `firebase deploy`

# Benachrichtigungen
Um Benachrichtigungen zu senden, muss die Funktion `sendNotification` regelmäßig ausgeführt werden.

# Admins
Wenn ein Nutzer Admin ist, kann er Nachrichten hinzufügen. Um ein Nutzer Admin zu machen muss sein uid in die admin List hinzugefügt werden.

# Firestore Struktur
Schema:
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
│   │   └── newLink <String>
│   └── versions
│       ├── forceUpdate <bool>
│       ├── message <List<String>>
│       └── newVersion <String>
│
├── news
│   └── news
│       └── news <List<Map>>
│           ├── text <String>
│           └── title <String>
│
├── userFriends
│   └── <userUID>
│       ├── friends <List<String>>
│       └── requests <List<String>>
│
└── userdata
    └── <userUID>
        ├── lastNotification <String>
        ├── name <String>
        ├── notification <bool>
        ├── personalSubstitute <bool>
        ├── schoolClass <String>
        ├── subjects <List<String>>
        ├── subjectsCustom <List<String>>
        ├── subjectsNot <List<String>>
        ├── subjectsNotCustom <List<String>>
        └── token <String>
```