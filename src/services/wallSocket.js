// Death Note Public Wall Real-Time WebSocket Client
// Handles bi-directional synchronization, auto-reconnect, and events

class WallSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.onlineCount = 1;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.isManualClose = false;
  }

  getWsUrl() {
    if (typeof window === 'undefined') return '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If running on Vite dev server (5173), direct connect to server on 3001
    if (window.location.port === '5173') {
      return `${protocol}//${window.location.hostname}:3001`;
    }
    // In production or when proxied, connect to same host
    return `${protocol}//${window.location.host}`;
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('status', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleServerMessage(message);
        } catch (e) {
          console.error('[WallSocket] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('status', { connected: false });
        if (!this.isManualClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WallSocket] Connection warning:', err);
      };
    } catch (err) {
      console.error('[WallSocket] Init failed:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  handleServerMessage(msg) {
    if (msg.type === 'INIT') {
      this.onlineCount = msg.onlineCount || 1;
      this.emit('init', { data: msg.data || {}, onlineCount: this.onlineCount });
    } else if (msg.type === 'ONLINE_COUNT') {
      this.onlineCount = msg.count || 1;
      this.emit('online_count', this.onlineCount);
    } else if (msg.type === 'ADD_ENTRY') {
      this.emit('add_entry', { pageNum: msg.pageNum, entry: msg.entry });
    } else if (msg.type === 'TOGGLE_STRIKE') {
      this.emit('toggle_strike', { pageNum: msg.pageNum, id: msg.id, crossedOut: msg.crossedOut });
    } else if (msg.type === 'DELETE_ENTRY') {
      this.emit('delete_entry', { pageNum: msg.pageNum, id: msg.id });
    } else if (msg.type === 'ERROR') {
      this.emit('error', msg.message);
    }
  }

  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
      return true;
    }
    return false;
  }

  addEntry(pageNum, entry) {
    return this.send('ADD_ENTRY', { pageNum, entry });
  }

  toggleStrike(pageNum, id, crossedOut) {
    return this.send('TOGGLE_STRIKE', { pageNum, id, crossedOut });
  }

  deleteEntry(pageNum, id) {
    return this.send('DELETE_ENTRY', { pageNum, id });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      const set = this.listeners.get(event);
      if (set) set.delete(callback);
    };
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WallSocket] Listener error for ${event}:`, e);
        }
      });
    }
  }

  disconnect() {
    this.isManualClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const wallSocket = new WallSocket();
export default wallSocket;
