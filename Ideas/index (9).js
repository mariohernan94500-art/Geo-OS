import express from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/sqlite.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son requeridos' });
    }

    const db = await getDatabase();

    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario o email ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.run(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [id, username, email, passwordHash, 'user']
    );

    return res.status(201).json({ id, username, email, role: 'user' });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = await getDatabase();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jsonwebtoken.sign(
      { id: user.id, username: user.username, role: user.role, tenant_id: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

authRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase();

    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});
