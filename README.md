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
Um Benachrichtigungen zu senden, muss die Funktion `sendNotification` regelmäßig ausgeführt werden