import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import cors from 'cors';
import errorHandler from './middlewares/error-handler';
import { DB_ADDRESS } from './config';
import routes from './routes';

const { PORT = 3000, ALLOWED_CORS } = process.env;
const app = express();
mongoose.connect(DB_ADDRESS);

const corsFromEnv = (ALLOWED_CORS ?? '')
  .split(',')
  .map((o) => o.trim().replace(/\r/g, ''))
  .filter(Boolean);
const corsOrigins =
  corsFromEnv.length > 0
    ? corsFromEnv
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

/** Фронты *.students.nomorepartiessite.ru (Практикум): на случай опечаток в ALLOWED_CORS */
const practicumFrontOrigin = /^https:\/\/[a-z0-9-]+\.students\.nomorepartiessite\.ru$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (corsOrigins.includes(origin) || practicumFrontOrigin.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Краштест для ревью (Практикум): удалить после успешного прохождения ревью.
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(routes);
app.use(errors());
app.use(errorHandler);

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log('ok'));
