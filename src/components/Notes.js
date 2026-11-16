import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000
});

function errorMessage(error, fallback) {
  return error?.response?.data?.error || fallback;
}

function formatDate(date) {
  if (!date) return '';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleString();
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const loadNotes = useCallback(async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Could not load notes. Check that the backend and database are running.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter a title and content.');
      return;
    }

    setBusy(true);
    try {
      await api.post('/insert', { title, content });
      setTitle('');
      setContent('');
      setShowCreate(false);
      await loadNotes();
      toast.success('Note created successfully.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create the note.'));
    } finally {
      setBusy(false);
    }
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Please enter a title and content.');
      return;
    }

    setBusy(true);
    try {
      await api.post('/update', {
        note_id: editingId,
        title_update: editTitle,
        content_update: editContent
      });
      cancelEditing();
      await loadNotes();
      toast.success('Note updated successfully.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the note.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;

    setBusy(true);
    try {
      await api.post('/delete', { id });
      if (editingId === id) cancelEditing();
      await loadNotes();
      toast.success('Note deleted successfully.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the note.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container py-4">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="d-flex align-items-center justify-content-between mb-4 gap-2">
        <h1 className="mb-0">Quick Notes 📝</h1>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => setShowCreate((current) => !current)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          {showCreate ? 'Close' : 'Add Note'}
        </button>
      </div>

      {showCreate && (
        <form className="card shadow-sm mb-4" onSubmit={handleCreate}>
          <div className="card-body">
            <h2 className="h5">Add Note</h2>
            <div className="mb-3">
              <label htmlFor="new-note-title" className="form-label">Title</label>
              <input
                id="new-note-title"
                className="form-control"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="new-note-content" className="form-label">Content</label>
              <textarea
                id="new-note-content"
                className="form-control"
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={10000}
                required
              />
            </div>
            <button type="submit" className="btn btn-success" disabled={busy}>
              {busy ? 'Saving...' : 'Save Note'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" disabled={busy} onClick={() => setShowCreate(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between gap-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadNotes}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p role="status">Loading notes...</p>
      ) : notes.length === 0 && !error ? (
        <p className="text-muted">No notes yet. Add your first note!</p>
      ) : (
        <div className="row g-3">
          {notes.map((note) => (
            <div className="col-12 col-lg-6" key={note.id}>
              <article className="card h-100 shadow-sm">
                <div className="card-body">
                  {editingId === note.id ? (
                    <form onSubmit={handleUpdate}>
                      <h2 className="h5">Edit Note</h2>
                      <div className="mb-3">
                        <label className="form-label" htmlFor={`edit-title-${note.id}`}>Title</label>
                        <input
                          id={`edit-title-${note.id}`}
                          className="form-control"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          maxLength={255}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor={`edit-content-${note.id}`}>Content</label>
                        <textarea
                          id={`edit-content-${note.id}`}
                          className="form-control"
                          rows={3}
                          value={editContent}
                          onChange={(event) => setEditContent(event.target.value)}
                          maxLength={10000}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-success btn-sm" disabled={busy}>
                        {busy ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm ms-2" disabled={busy} onClick={cancelEditing}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <h2 className="h5 card-title mb-2">{note.title}</h2>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm edit-btn"
                            aria-label={`Edit ${note.title}`}
                            disabled={busy}
                            onClick={() => startEditing(note)}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm delete-btn"
                            aria-label={`Delete ${note.title}`}
                            disabled={busy}
                            onClick={() => handleDelete(note.id)}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </div>
                      <p className="notes-content">{note.content}</p>
                      <div className="small text-muted mt-3">
                        {formatDate(note.created_at) && <div>Created: {formatDate(note.created_at)}</div>}
                        {formatDate(note.updated_at) && <div>Updated: {formatDate(note.updated_at)}</div>}
                      </div>
                    </>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
