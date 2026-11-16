# 📝 Quick Notes — Full-Stack Notes App

A notes application built with **React**, **Node.js**, **Express**, and **MySQL**. Users can create, view, edit, and delete notes through a React interface connected to a REST-style backend.

> **Project status:** Portfolio project. The repository contains a frontend/backend port mismatch that must be corrected before running it locally. See [Local setup](#local-setup) and [Known limitations](#known-limitations).

## Features

- **Create notes** with a title and content.
- **View saved notes** loaded from a MySQL database.
- **Edit notes** using an inline editing form.
- **Delete notes** and refresh the list.
- **Toast notifications** for successful create, update, and delete actions.
- **Creation and update timestamps** displayed on note cards when available.
- **Responsive Bootstrap-based interface** with Font Awesome icons.

Notes are stored in **MySQL**, not browser local storage. The current code does **not** implement note search, filtering, authentication, or offline sync.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, JavaScript, Create React App (`react-scripts`), Bootstrap 5 |
| UI | Font Awesome, React Toastify |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | MySQL, `mysql2` |
| Configuration | Environment variables loaded with `dotenv` |

## Project Structure

```text
note-app/
├── src/
│   ├── App.js                  # React app entry component
│   ├── index.js                # React DOM bootstrap
│   └── components/
│       └── Notes.js           # Notes UI and API requests
├── backend/
│   ├── database.js             # Express server, database pool, API endpoints
│   └── package.json
├── package.json                # Frontend scripts and dependencies
└── README.md
```

## Local Setup

### Prerequisites

- Node.js and npm
- A running MySQL server
- A MySQL database and a `notes` table

### 1. Clone the repository

```bash
git clone https://github.com/KhaldJallad/note-app.git
cd note-app
```

### 2. Install dependencies

```bash
npm install
cd backend
npm install
```

**Current dependency note:** `backend/database.js` imports `dotenv`, but the backend's own `package.json` does not list it. Installing the root dependencies as shown above supplies it via Node.js parent-directory module resolution. A future backend cleanup should declare `dotenv` directly in `backend/package.json`.

### 3. Create the database

Create a MySQL database and table that provide the fields used by the existing SQL queries. For example:

```sql
CREATE DATABASE notes_app;
USE notes_app;

CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);
```

This is a **suggested schema inferred from the application code**, not a database migration included in the repository.

### 4. Configure the backend

Create `backend/.env` with your own local database settings:

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=notes_app
```

Do not commit this file or real database credentials to GitHub.

**Important port fix:** The current `backend/database.js` contains:

```js
const port = 3306;
```

The frontend, however, sends requests to `http://localhost:8080`. Before running the app, change the Express server port line in `backend/database.js` to:

```js
const port = 8080;
```

MySQL normally uses port 3306 for its own service; the Express API should run on a separate port. **This README update documents the required change but does not modify the application code.**

### 5. Start the backend

From the `backend` directory:

```bash
npm start
```

With the port change above, the API should be available at `http://localhost:8080`.

### 6. Start the frontend

Open a second terminal from the repository root:

```bash
npm start
```

Create React App typically opens the frontend at `http://localhost:3000`.

The frontend currently uses a hardcoded API URL pointing to `http://localhost:8080`.

## API Endpoints

Implemented in `backend/database.js`:

| Method | Endpoint | Purpose | Request body |
| --- | --- | --- | --- |
| `GET` | `/notes` | Retrieve saved notes | — |
| `POST` | `/insert` | Create a note | `{ "title": "...", "content": "..." }` |
| `POST` | `/update` | Update a note | `{ "note_id": 1, "title_update": "...", "content_update": "..." }` |
| `POST` | `/delete` | Delete a note | `{ "id": 1 }` |

All routes are served by the local Express backend. These are the application's **existing** endpoints, not proposed replacements.

## How It Works

1. The React notes component requests `GET /notes` when mounted.
2. Express reads the saved notes from MySQL using a connection pool.
3. The UI renders note cards, including available timestamps and edit/delete controls.
4. User actions send Axios requests to the matching Express endpoints.
5. After a successful change, the UI fetches the notes again and displays a toast notification.

## Known Limitations

The repository is useful for demonstrating frontend/backend integration, but it still has areas to improve:

- **Port mismatch:** The backend listens on `3306` while the frontend targets `8080`; see the setup fix above.
- **Hardcoded API URL:** Move the frontend's API base URL into an environment-based configuration.
- **Backend dependencies:** Declare `dotenv` directly in the backend package.
- **API validation and responses:** Add input validation, consistent HTTP status codes, and safer error messages.
- **Security:** Add authentication/authorization if notes will be used by multiple users.
- **Secrets:** Ensure `.env` files are ignored by Git before sharing or deploying.
- **Maintainability:** Refactor direct DOM manipulation in the React component and add targeted tests.

## Possible Next Steps

- Add search and note filtering.
- Support user accounts and private notes.
- Add loading, empty, and error states for all API operations.
- Add a live demo and screenshots once the app runs reliably.
- Provide a database migration or setup script.

## Author

**Khaled Jallad** — [GitHub @KhaldJallad](https://github.com/KhaldJallad)
