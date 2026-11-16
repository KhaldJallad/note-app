# 📝 Quick Notes — React + Express + MySQL

A full-stack note-taking web application built with **React**, **Node.js**, **Express**, and **MySQL**. Create, view, edit, and delete saved notes in a responsive interface.

## Features

- Create notes with a title and content
- View saved notes with creation/update timestamps
- Edit or delete existing notes
- See loading states, error messages, and success toast notifications
- Responsive layout using Bootstrap 5

> Notes are stored in a local **MySQL** database. The application does not provide user accounts, authorization, search, or offline storage.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, JavaScript, Create React App, Bootstrap 5 |
| UI feedback and icons | React Toastify, Font Awesome |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | MySQL, mysql2 (parameterized queries) |
| Configuration | dotenv |

## Project Structure

```text
note-app/
├── src/
│   ├── App.js
│   ├── App.test.js
│   └── components/Notes.js
├── backend/
│   ├── database.js
│   ├── database.test.js
│   ├── schema.sql
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Run Locally

### 1. Prerequisites

Install **Node.js 18+**, npm, and MySQL. Make sure the MySQL service is running.

### 2. Clone and install

```bash
git clone https://github.com/KhaldJallad/note-app.git
cd note-app
npm install
cd backend
npm install
```

### 3. Create your database

Run `backend/schema.sql` in MySQL. From the MySQL CLI (while in `backend`):

```bash
mysql -u root -p < schema.sql
```

This creates the `quick_notes_app` database and the `notes` table, if they don't already exist. Adjust the MySQL user to your local configuration.

### 4. Configure backend environment

Copy the example to a **local** `backend/.env` file:

```bash
cp .env.example .env
```

On Windows, you can also copy the file in File Explorer.

Set your own credentials and desired ports:

```dotenv
PORT=8080
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=quick_notes_app
FRONTEND_ORIGIN=http://localhost:3000
```

The Express API defaults to port **8080**; MySQL normally uses **3306**. Those are **different** services. The backend now reads environment variables directly from `backend/.env`.

**Never commit `.env` or real credentials.** The repository's `.gitignore` excludes local environment files. A previously tracked local env file was removed from the current source tree; Git history still needs separate handling if it ever contained real secrets.

### 5. Start the backend

From the `backend` folder:

```bash
npm start
```

The API should start at `http://localhost:8080`. You can check `http://localhost:8080/` for a basic response. Note: the API can start even if the database connection is not working; check `/notes` to confirm that queries succeed.

### 6. Start the frontend

From the repository root in a second terminal:

```bash
npm start
```

The React development server normally runs at `http://localhost:3000`.

By default, React calls `http://localhost:8080`. To change this, create a **local** `.env` at the repository root with:

```dotenv
REACT_APP_API_URL=http://localhost:8080
```

Restart the frontend after changing React environment variables.

## API Reference

| Method | Endpoint | Purpose | Request body |
| --- | --- | --- | --- |
| GET | `/notes` | List notes | — |
| POST | `/insert` | Create a note | `{"title":"Title","content":"Text"}` |
| POST | `/update` | Update a note | `{"note_id":1,"title_update":"New title","content_update":"New text"}` |
| POST | `/delete` | Delete a note | `{"id":1}` |

The API validates note input and IDs, uses parameterized SQL queries, returns JSON responses, and provides meaningful HTTP status codes (including `400`, `404`, and `500`).

## Tests

Backend route and validation tests (using a mocked database):

```bash
cd backend
npm test
```

Frontend component tests:

```bash
# from repository root
CI=true npm test -- --watch=false
```

The automated backend tests do **not** replace testing with a real MySQL server. Verify create, list, edit, and delete locally after configuration.

## Known Limitations and Future Improvements

- This is a **single-user learning/portfolio project**: there is no authentication, so do not expose it publicly with unrestricted write access.
- Add integration tests against a test MySQL database.
- Add screenshots and a safe, hosted demo after deployment and security planning.
- Add search/filtering, pagination, and optional user accounts.
- Consider upgrading the Create React App tooling in a future maintenance update.

## Author

**Khaled Jallad** · [GitHub](https://github.com/KhaldJallad)
