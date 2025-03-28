import axios from 'axios';
import { BrowserWindow } from 'electron';
import sqlite3 from 'sqlite3';
import { checkInternet } from '../utils';

sqlite3.verbose();

export interface ApiRequest {
  id?: number;
  url?: string;
  method: string;
  payload?: string | null;
  headers?: string | null | Record<string, any>;
}

const db = new sqlite3.Database(
  './database.db',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err: any) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Connected to SQLite database.');
  },
);

db.run(
  `CREATE TABLE IF NOT EXISTS api_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        method TEXT NOT NULL,
        payload TEXT,
        headers TEXT,
        status INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
   
    )`,
  (err: any) => {
    if (err) console.error('Error creating table:', err.message);
  },
);

export const saveRequest = async (
  url: string,
  method: string,
  payload: any = null,
  headers: Record<string, string> = {},
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO api_requests (url, method, payload, headers) VALUES (?, ?, ?, ?)`;
    db.run(
      query,
      [url, method, JSON.stringify(payload), JSON.stringify(headers)],
      function (err: any) {
        if (err) {
          console.error('Error storing API request:', err.message);
          reject(err);
        } else {
          console.log(`Stored API request ID: ${this.lastID}`, this);
          resolve(this.lastID);
        }
      },
    );
  });
};

let isSyncing = false;

export const startSyncing = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isSyncing) return Promise.resolve(true);

    isSyncing = true;
    db.all(
      `SELECT * FROM api_requests WHERE status = 0`,
      async (err: any, rows: ApiRequest[]) => {
        if (err) {
          console.error('Error fetching stored requests:', err.message);
          reject(err);
          return;
        }
        console.log({ rows });

        for (const request of rows) {
          try {
            const response = await axios({
              method: request.method,
              url: request.url,
              data: request.payload ? JSON.parse(request.payload) : null,
              headers: request.headers
                ? JSON.parse(request.headers as string)
                : {},
            });

            console.log(
              `API request ID ${request.id} sent successfully:`,
              response.status,
            );

            setTimeout(() => {
              BrowserWindow.getAllWindows().forEach((win) => {
                if (win && win.webContents) {
                  console.log('Sending event to renderer:', request.id);
                  win.webContents.send('api-sync-update', {
                    id: request.id,
                    status: 'completed',
                  });
                } else {
                  console.log('No active window found');
                }
              });
            }, 1000);

            db.run(`DELETE FROM api_requests WHERE id = ?`, [request.id]);
          } catch (error: any) {
            console.error(
              error,
              `Error sending API request ID ${request.id}:`,
              error.message,
            );
          }
        }
      },
    );

    isSyncing = false;
    resolve();
  });
};

export const getSavedRequests = () => {
  return new Promise((res, rej) => {
    db.all(
      `SELECT * FROM api_requests WHERE status = 0`,
      async (err: any, rows: ApiRequest[]) => {
        if (err) {
          console.error('Error fetching stored requests:', err.message);
          rej(err);
          return;
        }
        res(rows);
      },
    );
  });
};

export const checkNetworkAndProcessRequests = async (): Promise<void> => {
  return checkInternet() // TOOD: FIXME: Use health check mechanism to check for network connectivity
    .then(async (result) => await startSyncing());
};
