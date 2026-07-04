import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error(`CORS bloqueado para origem: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'nuckleo-backend-node',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

// Rotas REST completas
import spacesRouter from './src/routes/spaces.js';
import itemsRouter from './src/routes/items.js';
import usersRouter from './src/routes/users.js';
import friendsRouter from './src/routes/friends.js';
import notificationsRouter from './src/routes/notifications.js';

app.use('/api/spaces', spacesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/notifications', notificationsRouter);

async function connectMongo() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.warn('[mongo] MONGO_URI não definida — servidor sobe sem banco.');
        return;
    }
    try {
        await mongoose.connect(uri);
        console.log('[mongo] Conectado com sucesso.');
    } catch (err) {
        console.error('[mongo] Falha na conexão:', err.message);
    }
}

app.listen(PORT, () => {
    console.log(`[nuckleo-api] Rodando na porta ${PORT}`);
    console.log(`[nuckleo-api] CORS: ${corsOrigins.join(', ')}`);
    connectMongo();
});