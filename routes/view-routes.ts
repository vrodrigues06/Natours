import express from 'express';
import {
  getAccount,
  getLoginPage,
  getMyTours,
  getOverview,
  getTour,
  updateUserData,
} from '../controllers/views-controller.js';
import { isLoggedIn, protectRoute } from '../controllers/auth-controller.js';
import { createBookingCheckout } from '../controllers/booking-controller.js';

export const viewRouter = express.Router();

viewRouter.get('/', createBookingCheckout, isLoggedIn, getOverview);

viewRouter.get('/tour/:slug', isLoggedIn, getTour);

viewRouter.get('/login', isLoggedIn, getLoginPage);
viewRouter.get('/me', protectRoute, getAccount);
viewRouter.get('/my-tours', protectRoute, getMyTours);

viewRouter.post('/submit-user-data', protectRoute, updateUserData);
