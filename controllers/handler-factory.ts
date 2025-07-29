// @ts-nocheck
import { NextFunction } from 'express';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';
import { APIFeatures } from '../utils/api-features.js';

export const deleteOne = (Model) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id)
      next(new AppError('To delete, you must provide an ID.', 400));

    const doc = await model.deleteOne({ _id: req.params.id });

    if (doc.deletedCount === 0) {
      return next(new AppError('No Doc found with that ID to delete', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id)
      return next(new AppError('To update, you must provide an ID.', 400));

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return next(new AppError('No Doc found with that ID to update', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No Doc found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const getAll = (Model) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    if (!doc || doc.length === 0) {
      return next(new AppError('No documents found with that filter', 404));
    }

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
