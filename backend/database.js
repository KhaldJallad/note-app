const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const MAX_TITLE_LENGTH = 255;
const MAX_CONTENT_LENGTH = 10000;

function validateNote(title, content) {
  if (typeof title !== 'string' || !title.trim()) {
    return { error: 'A note title is required.' };
  }
  if (title.trim().length > MAX_TITLE_LENGTH) {
    return { error: 'The title must be 255 characters or fewer.' };
  }
  if (typeof content !== 'string' || !content.trim()) {
    return { error: 'Note content is required.' };
  }
  if (content.trim().length > MAX_CONTENT_LENGTH) {
    return { error: 'Note content must be 10,000 characters or fewer.' };
  }

  return { title: title.trim(), content: content.trim() };
}

function parseNoteId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function createApp(db) {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/', (_req, res) => res.json({ status: 'ok', service: 'Quick Notes API' }));

  app.get('/notes', async (_req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY created_at DESC, id DESC'
      );
      res.json(rows);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      res.status(500).json({ error: 'Unable to load notes.' });
    }
  });

  app.post('/insert', async (req, res) => {
    const note = validateNote(req.body?.title, req.body?.content);
    if (note.error) return res.status(400).json({ error: note.error });

    try {
      const [result] = await db.execute(
        'INSERT INTO notes (title, content, created_at) VALUES (?, ?, NOW())',
        [note.title, note.content]
      );
      res.status(201).json({ message: 'Note created successfully.', id: result.insertId });
    } catch (error) {
      console.error('Failed to create note:', error);
      res.status(500).json({ error: 'Unable to create the note.' });
    }
  });

  app.post('/update', async (req, res) => {
    const id = parseNoteId(req.body?.note_id);
    if (!id) return res.status(400).json({ error: 'A valid note ID is required.' });

    const note = validateNote(req.body?.title_update, req.body?.content_update);
    if (note.error) return res.status(400).json({ error: note.error });

    try {
      const [result] = await db.execute(
        'UPDATE notes SET title = ?, content = ?, updated_at = NOW() WHERE id = ?',
        [note.title, note.content, id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Note not found.' });
      res.json({ message: 'Note updated successfully.' });
    } catch (error) {
      console.error('Failed to update note:', error);
      res.status(500).json({ error: 'Unable to update the note.' });
    }
  });

  app.post('/delete', async (req, res) => {
    const id = parseNoteId(req.body?.id);
    if (!id) return res.status(400).json({ error: 'A valid note ID is required.' });

    try {
      const [result] = await db.execute('DELETE FROM notes WHERE id = ?', [id]);
      if (!result.affectedRows) return res.status(404).json({ error: 'Note not found.' });
      res.json({ message: 'Note deleted successfully.' });
    } catch (error) {
      console.error('Failed to delete note:', error);
      res.status(500).json({ error: 'Unable to delete the note.' });
    }
  });

  return app;
}

if (require.main === module) {
  const db = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'quick_notes_app',
    waitForConnections: true,
    connectionLimit: 10
  });

  const port = Number(process.env.PORT) || 8080;
  createApp(db).listen(port, () => {
    console.log(`Quick Notes API listening on http://localhost:${port}`);
  });
}

module.exports = { createApp };
