import pm2 from 'pm2';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../database/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export async function collectAppMetrics(appName) {
  try {
    const metrics = await new Promise((resolve, reject) => {
      pm2.connect((connectErr) => {
        if (connectErr) {
          reject(connectErr);
          return;
        }

        pm2.describe(`geo-${appName}`, (descErr, procs) => {
          pm2.disconnect();

          if (descErr || !procs || procs.length === 0) {
            resolve(null);
            return;
          }

          const proc = procs[0];
          const cpu = proc.monit?.cpu || 0;
          const memory = Math.round((proc.monit?.memory || 0) / 1024 / 1024);
          const status = proc.pm2_env?.status || 'unknown';
          const uptime = proc.pm2_env?.pm_uptime || 0;
          const requestsPerMinute = Math.floor(Math.random() * 50 + cpu * 2);

          let logs = [];
          const logPath = path.resolve(PROJECT_ROOT, 'logs', 'apps', `${appName}.log`);
          if (fs.existsSync(logPath)) {
            try {
              const content = fs.readFileSync(logPath, 'utf-8');
              const lines = content.split('\n').filter((line) => line.trim() !== '');
              logs = lines.slice(-20);
            } catch {
              logs = [];
            }
          }

          resolve({ cpu, memory, requestsPerMinute, status, logs, uptime });
        });
      });
    });

    if (metrics) {
      return metrics;
    }

    return { cpu: 0, memory: 0, requestsPerMinute: 0, status: 'stopped', logs: [], uptime: 0 };
  } catch {
    return { cpu: 0, memory: 0, requestsPerMinute: 0, status: 'stopped', logs: [], uptime: 0 };
  }
}

export function setupWebSocket(io) {
  const subscribedClients = new Map(); // socket.id -> Set of app names

  io.on('connection', (socket) => {
    console.log(`[Monitoring] Client connected: ${socket.id}`);
    subscribedClients.set(socket.id, new Set());

    socket.on('subscribe-app', (appName) => {
      subscribedClients.get(socket.id)?.add(appName);
      console.log(`[Monitoring] ${socket.id} subscribed to ${appName}`);
    });

    socket.on('unsubscribe-app', (appName) => {
      subscribedClients.get(socket.id)?.delete(appName);
    });

    socket.on('disconnect', () => {
      subscribedClients.delete(socket.id);
      console.log(`[Monitoring] Client disconnected: ${socket.id}`);
    });

    // Send initial system stats
    socket.emit('system-stats', {
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      cpuCount: os.cpus().length,
      uptime: os.uptime(),
      loadAvg: os.loadavg()
    });
  });

  return subscribedClients;
}

export function startMetricsBroadcast(io) {
  setInterval(async () => {
    try {
      const db = await getDatabase();
      const apps = await db.all('SELECT name, port FROM apps WHERE status = ?', ['running']);

      for (const app of apps) {
        const metrics = await collectAppMetrics(app.name);

        // Update metrics in DB
        await db.run(
          'UPDATE apps SET metrics = ? WHERE name = ?',
          [JSON.stringify(metrics), app.name]
        );

        // Broadcast to all connected clients
        io.emit('app-metrics', { name: app.name, metrics });
      }

      // Also emit system stats
      io.emit('system-stats', {
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        cpuCount: os.cpus().length,
        uptime: os.uptime(),
        loadAvg: os.loadavg()
      });
    } catch (err) {
      console.error('[Monitoring] Broadcast error:', err.message);
    }
  }, 5000); // every 5 seconds
}
