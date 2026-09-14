import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, '../data/entries.json');
const PORT = process.env.PORT || 3001;

// Default canonical seed entries so the book is never completely blank initially
const DEFAULT_PAGES = {
  1: [
    { id: 'seed-1', text: 'Kuro Otoharada', crossedOut: false, createdAt: Date.now() - 10000000 },
    { id: 'seed-2', text: 'Takuo Shibuimaru', crossedOut: false, createdAt: Date.now() - 9000000 },
    { id: 'seed-3', text: 'Lind L. Tailor', crossedOut: true, createdAt: Date.now() - 8000000 }
  ]
};

let pagesData = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    pagesData = JSON.parse(raw);
  } else {
    pagesData = DEFAULT_PAGES;
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(pagesData, null, 2), 'utf-8');
  }
} catch (e) {
  console.error('Error loading data file:', e);
  pagesData = DEFAULT_PAGES;
}

let saveTimer = null;
function persistData() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(pagesData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data file:', e);
    }
  }, 300);
}

// REST fallback endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', online: wss ? wss.clients.size : 0 });
});

app.get('/api/entries', (req, res) => {
  res.json(pagesData);
});

// Serve dist files in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(msg) {
  const json = typeof msg === 'string' ? msg : JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

function broadcastOnlineCount() {
  broadcast({
    type: 'ONLINE_COUNT',
    count: wss.clients.size
  });
}

// Rate limiting map
const lastWriteMap = new Map();

wss.on('connection', (ws, req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // Send initial data to newly connected client
  ws.send(JSON.stringify({
    type: 'INIT',
    data: pagesData,
    onlineCount: wss.clients.size
  }));

  broadcastOnlineCount();

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());

      if (parsed.type === 'ADD_ENTRY') {
        const { pageNum, entry } = parsed;
        if (!pageNum || !entry || !entry.text) return;

        const cleanText = String(entry.text).trim().substring(0, 80);
        if (!cleanText) return;

        // Rate limiting (1 entry every 1.2s per IP)
        const now = Date.now();
        const lastWrite = lastWriteMap.get(ip) || 0;
        if (now - lastWrite < 1200) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Çok hızlı yazıyorsunuz. Lütfen biraz bekleyin.'
          }));
          return;
        }
        lastWriteMap.set(ip, now);

        const newEntry = {
          id: entry.id || ('dn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
          text: cleanText,
          crossedOut: false,
          createdAt: Date.now()
        };

        const MAX_PER_PAGE = 10;
        let targetPage = Number(pageNum) || 1;
        while ((pagesData[targetPage] || []).length >= MAX_PER_PAGE) {
          targetPage++;
        }

        if (!pagesData[targetPage]) pagesData[targetPage] = [];
        pagesData[targetPage].push(newEntry);
        persistData();

        broadcast({
          type: 'ADD_ENTRY',
          pageNum: targetPage,
          entry: newEntry
        });
      }

      if (parsed.type === 'TOGGLE_STRIKE') {
        const { pageNum, id, crossedOut } = parsed;
        if (pagesData[pageNum]) {
          let updatedState = false;
          pagesData[pageNum] = pagesData[pageNum].map((item) => {
            if (item.id === id) {
              const target = typeof crossedOut === 'boolean' ? crossedOut : !item.crossedOut;
              updatedState = target;
              return { ...item, crossedOut: target };
            }
            return item;
          });
          persistData();
          broadcast({
            type: 'TOGGLE_STRIKE',
            pageNum,
            id,
            crossedOut: updatedState
          });
        }
      }

      if (parsed.type === 'DELETE_ENTRY') {
        const { pageNum, id } = parsed;
        if (pagesData[pageNum]) {
          pagesData[pageNum] = pagesData[pageNum].filter((item) => item.id !== id);
          persistData();
          broadcast({
            type: 'DELETE_ENTRY',
            pageNum,
            id
          });
        }
      }
    } catch (err) {
      console.error('WS message error:', err);
    }
  });

  ws.on('close', () => {
    broadcastOnlineCount();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('⚡ Death Note Public Wall Server running on http://0.0.0.0:' + PORT);
});
