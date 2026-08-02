# Architecture

## Overview

My Duolingo uses a modular client-server architecture.

```
Frontend (PWA)
        │
        │ HTTPS / JSON
        ▼
Google Apps Script (REST API)
        │
        ▼
Google Sheets (Database)
```

---

## Frontend

Technology:

- HTML5
- CSS3
- JavaScript (ES6)
- PWA
- SpeechSynthesis API

Responsibilities:

- User Interface
- Training Logic
- API Communication
- Offline Cache (future)

---

## Backend

Technology:

- Google Apps Script

Responsibilities:

- REST API
- Business Logic
- Validation
- Authentication (future)
- Google Sheets Integration

---

## Database

Technology:

- Google Sheets

Stores:

- Vocabulary
- Irregular Verbs
- Learning Progress
- User Settings (future)

---

## Principles

- Modular architecture
- REST API
- JSON communication
- Frontend and Backend separation
- No secrets in Git
- Scalable design
