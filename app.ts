// @ts-nocheck
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { tourRouter } from './routes/tour-routes.js';
import { userRouter } from './routes/user-routes.js';
import { AppError } from './utils/app-error.js';
import { globalErrorHandler } from './controllers/error-controller.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss, { whiteList } from 'xss-clean';
import hpp from 'hpp';
import { reviewRouter } from './routes/review-routes.js';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { viewRouter } from './routes/view-routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { bookingRouter } from './routes/booking-routes.js';

export const API_URL = '/api/v1';
export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));
// SET Secure HTTPS Requests
// app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'http://localhost:3333',
        'http://127.0.0.1:3333',
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'https://js.stripe.com',
        'https://checkout.stripe.com',
      ],
      scriptSrc: ["'self'", 'https://api.mapbox.com', 'https://js.stripe.com'],
      styleSrc: [
        "'self'",
        'https://fonts.googleapis.com',
        'https://api.mapbox.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://api.mapbox.com'],
      workerSrc: ["'self'", 'blob:'],
      frameSrc: ['https://js.stripe.com', 'https://checkout.stripe.com'],
    },
  })
);

// app.use(cors());
app.use(
  cors({
    origin: 'http://localhost:3333', // ou o domínio real do front
    credentials: true,
  })
);

// Development Looging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit Requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, you must try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization agains XSS
app.use(xss());

// Prevent parameter pollution
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test Middlewares
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.cookies);
//   next();
// });

app.use('/', viewRouter);
app.use(`${API_URL}/tours`, tourRouter);
app.use(`${API_URL}/users`, userRouter);
app.use(`${API_URL}/reviews`, reviewRouter);
app.use(`${API_URL}/bookings`, bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
