// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { Tours } from '../models/tour-model.js';
import { APIFeatures } from '../utils/api-features.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';
import { stripe } from '../utils/stripe.js';
import { Booking } from '../models/booking-model.js';
import {
  createOne,
  getAll,
  deleteOne,
  updateOne,
  getOne,
} from './handler-factory.js';

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tourId = req.params.tourId;

  const currentTour = await Tours.findById(tourId);

  if (!currentTour) {
    return next(new AppError('no tour find with that id!', 404));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${currentTour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    customer_email: req.user?.email,
    client_reference_id: tourId,
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: currentTour.name,
            description: currentTour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                currentTour.imageCover
              }`,
            ],
          },
          unit_amount: currentTour.price * 100, // Stripe expects the amount in cents
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

export const createBooking = createOne(Booking);
export const getBooking = getOne(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);
export const getAllBookings = getAll(Booking);
