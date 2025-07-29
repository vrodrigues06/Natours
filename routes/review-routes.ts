// @ts-nocheck
import express from 'express';
import { protectRoute, restrictTo } from '../controllers/auth-controller.js';
import {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  getAllReviews,
  setTourUserIds,
} from '../controllers/review-controller.js';

export const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protectRoute); // Protege todas as rotas abaixo

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

reviewRouter
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);
