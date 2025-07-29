// @ts-nocheck

import { Booking } from '../models/booking-model.js';
import { Tours } from '../models/tour-model.js';
import { catchAsync } from '../utils/catch-async.js';

export const getOverview = catchAsync(async (req, res) => {
  const tours = await Tours.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours || [],
  });
});

export const getTour = catchAsync(async (req, res) => {
  const tour = await Tours.findOne({ slug: req.params.slug }).populate(
    'reviews'
  ); // se reviews são refs
  if (!tour) {
    return res.status(404).render('error', {
      title: 'Tour not found',
      message: 'We could not find the tour you are looking for.',
    });
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour: tour || {},
  });
});

export const getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

export const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

export const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await Users.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

export const getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const toursId = bookings.map((booking) => booking.tour);
  const tours = await Tours.find({ _id: { $in: toursId } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tours || [],
  });
});
