const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./database');

async function withServer(db, run) {
  const server = createApp(db).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  try {
    await run(base);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

async function post(base, route, data) {
  return fetch(base + route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

test('GET /notes returns saved notes', async () => {
  const db = {
    execute: async (sql) => {
      assert.match(sql, /SELECT id, title, content/);
      return [[{ id: 1, title: 'Sample', content: 'Hello' }]];
    }
  };

  await withServer(db, async (base) => {
    const response = await fetch(base + '/notes');
    assert.equal(response.status, 200);
    assert.equal((await response.json())[0].title, 'Sample');
  });
});

test('POST /insert validates and inserts a note using placeholders', async () => {
  let executed = false;
  const db = {
    execute: async (sql, params) => {
      executed = true;
      assert.match(sql, /VALUES \(\?, \?, NOW\(\)\)/);
      assert.deepEqual(params, ['Sample', 'Body']);
      return [{ insertId: 42 }];
    }
  };

  await withServer(db, async (base) => {
    const invalid = await post(base, '/insert', { title: '', content: 'Body' });
    assert.equal(invalid.status, 400);
    assert.equal(executed, false);

    const response = await post(base, '/insert', { title: ' Sample ', content: ' Body ' });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).id, 42);
    assert.equal(executed, true);
  });
});

test('POST /update and /delete report success or missing notes', async () => {
  const calls = [];
  const db = {
    execute: async (sql, params) => {
      calls.push({ sql, params });
      return [{ affectedRows: params.at(-1) === 999 ? 0 : 1 }];
    }
  };

  await withServer(db, async (base) => {
    const updated = await post(base, '/update', {
      note_id: 7, title_update: 'Updated', content_update: 'New body'
    });
    assert.equal(updated.status, 200);
    assert.deepEqual(calls[0].params, ['Updated', 'New body', 7]);

    const missing = await post(base, '/update', {
      note_id: 999, title_update: 'Updated', content_update: 'New body'
    });
    assert.equal(missing.status, 404);

    const removed = await post(base, '/delete', { id: 7 });
    assert.equal(removed.status, 200);

    const invalid = await post(base, '/delete', { id: 'not-an-id' });
    assert.equal(invalid.status, 400);
    assert.equal(calls.length, 3);
  });
});

test('GET /notes sends a safe error response when the database fails', async () => {
  const db = { execute: async () => { throw new Error('private database details'); } };
  const originalError = console.error;
  console.error = () => {};
  try {
    await withServer(db, async (base) => {
      const response = await fetch(base + '/notes');
      assert.equal(response.status, 500);
      const data = await response.json();
      assert.equal(data.error, 'Unable to load notes.');
    });
  } finally {
    console.error = originalError;
  }
});
