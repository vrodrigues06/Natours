// @ts-nocheck

import express from 'express';

import {
  aliasTopTours,
  createTour,
  deleteTour,
  getAllTours,
  getDistances,
  getMonthlyPlan,
  getTour,
  getTourStats,
  getToursWithin,
  updateTour,
  uploadTourImages,
  resizeTourImages,
} from '../controllers/tour-controller.js';
import { protectRoute, restrictTo } from '../controllers/auth-controller.js';
import { createReview } from '../controllers/review-controller.js';
import { reviewRouter } from './review-routes.js';

export const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);
tourRouter
  .route('/')
  .get(getAllTours)
  .post(
    protectRoute,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    createTour
  );
tourRouter.route('/top-5-cheap-tours').get(aliasTopTours, getAllTours);
tourRouter.route('/tour-stats').get(getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    protectRoute,
    restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(
    protectRoute,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protectRoute, restrictTo('admin', 'lead-guide'), deleteTour);
