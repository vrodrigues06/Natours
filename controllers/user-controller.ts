// @ts-nocheck
import express, { NextFunction, Request, Response, Router } from 'express';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';
import { Users } from '../models/user-model.js';
import { deleteOne, updateOne, getAll, getOne } from './handler-factory.js';
import sharp from 'sharp';
import multer from 'multer';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields: string[]) => {
  const newObj = {};
  Object.keys(obj).forEach((k) => {
    if (allowedFields.includes(k)) newObj[k] = obj[k];
  });

  return newObj;
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  req.params.id = req.user.id; // For the getOne function to work
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await Users.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Users.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

export const createUser = (req: Request, res: Response) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

export const getUser = getOne(Users);
export const getAllUsers = getAll(Users);

// Do NOT update passwords with this!
export const updateUser = updateOne(Users);
export const deleteUser = deleteOne(Users);
