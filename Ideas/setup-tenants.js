// scripts/setup-tenants.js — Initial database setup and seeding
// Usage: node scripts/setup-tenants.js

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Load env from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function setup() {
  console.log('========================================');
  console.log('  🔧 Geo AI System - Database Setup');
  console.log('========================================\n');

  try {
    // Import database module
    const { initializeDatabase, getDatabase } = await import('../modules/database/sqlite.js');
    
    // Initialize tables
    console.log('[Setup] Creating database tables...');
    await initializeDatabase();
    console.log('[Setup] ✅ Tables created\n');

    const db = await getDatabase();

    // Create default tenant
    const tenantId = uuidv4();
    try {
      await db.run(
        'INSERT INTO tenants (id, name, subdomain, status) VALUES (?, ?, ?, ?)',
        [tenantId, 'Default Tenant', 'default', 'active']
      );
      console.log('[Setup] ✅ Default tenant created (id: ' + tenantId + ')');
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        console.log('[Setup] ⚠️  Default tenant already exists, skipping');
      } else {
        throw err;
      }
    }

    // Create admin user
    const adminId = uuidv4();
    const adminPassword = 'admin123'; // Change this in production!
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    try {
      await db.run(
        'INSERT INTO users (id, username, email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, 'admin', 'admin@geo.local', passwordHash, 'admin', tenantId]
      );
      console.log('[Setup] ✅ Admin user created');
      console.log('   Username: admin');
      console.log('   Email:    admin@geo.local');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!\n');
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        console.log('[Setup] ⚠️  Admin user already exists, skipping\n');
      } else {
        throw err;
      }
    }

    // Create data directories
    const fs = await import('fs');
    const dataDir = path.resolve(__dirname, '..', 'data');
    const appsDir = path.resolve(__dirname, '..', 'apps');
    const logsDir = path.resolve(__dirname, '..', 'logs', 'apps');

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(appsDir)) fs.mkdirSync(appsDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    console.log('[Setup] ✅ Directories verified');
    
    // Initialize memory.json if it doesn't exist
    const memoryPath = path.resolve(dataDir, 'memory.json');
    if (!fs.existsSync(memoryPath)) {
      fs.writeFileSync(memoryPath, JSON.stringify({ templates: [], learned_patterns: [], generated_apps: [] }, null, 2));
      console.log('[Setup] ✅ memory.json created');
    } else {
      console.log('[Setup] ✅ memory.json exists');
    }

    console.log('\n========================================');
    console.log('  ✅ Setup complete!');
    console.log('  Run "npm start" to launch Geo');
    console.log('========================================');

    process.exit(0);
  } catch (err) {
    console.error('[Setup] ❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

setup();
