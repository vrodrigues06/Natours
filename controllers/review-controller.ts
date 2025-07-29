// @ts-nocheck

import { Reviews } from '../models/review-model.js';
import { catchAsync } from '../utils/catch-async.js';
import {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} from './handler-factory.js';

export const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const createReview = createOne(Reviews);

export const deleteReview = deleteOne(Reviews);
export const updateReview = updateOne(Reviews);
export const getReview = getOne(Reviews);
export const getAllReviews = getAll(Reviews);
