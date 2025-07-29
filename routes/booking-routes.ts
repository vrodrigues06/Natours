// @ts-nocheck
import express from 'express';
import { protectRoute, restrictTo } from '../controllers/auth-controller.js';
import {
  getAllBookings,
  getCheckoutSession,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/booking-controller.js';

export const bookingRouter = express.Router();

bookingRouter.use(protectRoute); // Protege todas as rotas abaixo

bookingRouter.get(
  '/checkout-session/:tourId',
  restrictTo('user'),
  getCheckoutSession
);

bookingRouter.use(restrictTo('admin', 'lead-guide')); // Restringe as rotas abaixo a admin e lead-guide
bookingRouter
  .route('/')
  .get(getAllBookings) // Lista todas as reservas
  .post(createBooking); // Cria uma nova reserva

bookingRouter
  .route('/:id')
  .get(getBooking) // Obtém uma reserva específica
  .patch(updateBooking) // Atualiza uma reserva específica
  .delete(deleteBooking); // Deleta uma reserva específica
