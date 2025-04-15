# Restaurant Management System

Ein umfassendes Management-System für Restaurants mit Funktionen für verschiedene Rollen wie Manager, Administrator, Kellner und Küchenchef.

## Funktionen

- **Benutzerverwaltung** mit rollenbasierten Zugriffsrechten
- **Reservierungsverwaltung** für Tischbuchungen
- **Tischverwaltung** mit Statusaktualisierungen
- **Menüverwaltung** mit Kategorien und anpassbaren Gerichten
- **Bestellungsverwaltung** für Küche und Service
- **Dashboard** mit rollenspezifischen Übersichten und Statistiken

## Rollen und Zugriffsrechte

- **Manager**: Vollständiger Zugriff auf alle Funktionen, einschließlich Reservierungen, Tische, Bestellungen und Einstellungen
- **Administrator**: Systemeinstellungen und Benutzerverwaltung
- **Kellner**: Tisch- und Reservierungsverwaltung, Bestellungsaufnahme
- **Küchenchef**: Verwaltung von Bestellungen und Menü

## Installation

1. Repository klonen:
   ```
   git clone https://github.com/yourusername/restaurant-management.git
   cd restaurant-management
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Anwendung starten:
   ```
   npm start
   ```

Die Anwendung wird unter [http://localhost:3000](http://localhost:3000) geöffnet.

## Login-Informationen (Demo)

Für Testzwecke können folgende Anmeldedaten verwendet werden:

| Rolle      | Benutzername | Passwort    |
|------------|--------------|-------------|
| Manager    | manager      | manager123  |
| Admin      | admin        | admin123    |
| Kellner    | waiter       | waiter123   |
| Küchenchef | chef         | chef123     |

## Technologie-Stack

- **React**: Frontend-Bibliothek
- **React Router**: Für die Navigation
- **Material-UI**: UI-Komponenten
- **Recharts**: Für Diagramme und Visualisierungen
- **date-fns**: Datums- und Zeitverarbeitung

## Projektstruktur

```
src/
├── components/           # UI-Komponenten
│   ├── auth/             # Authentifizierungskomponenten
│   ├── dashboard/        # Dashboard für verschiedene Rollen
│   ├── profile/          # Benutzerprofilkomponenten
│   ├── reservations/     # Reservierungsverwaltung
│   ├── tables/           # Tischverwaltung
│   ├── menu/             # Menüverwaltung
│   └── settings/         # Einstellungen
├── context/              # React Context für globalen Zustand
│   ├── AuthContext.js    # Authentifizierungskontext
│   ├── ReservationContext.js  # Reservierungskontext
│   ├── TableContext.js   # Tischkontext
│   └── MenuContext.js    # Menükontext
└── App.jsx               # Hauptkomponente mit Routing
```

## Erweiterungsmöglichkeiten

- Integration einer Backend-API für persistente Datenspeicherung
- Implementierung einer Echtzeit-Benachrichtigungsfunktion
- Mobile App-Version für Kellner und Küchenpersonal
- Kundenportal für Online-Reservierungen
- Integration mit POS-Systemen

## Lizenz

MIT
