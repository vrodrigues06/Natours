// @ts-nocheck

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tours',
    required: [true, 'Booking must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: [true, 'Booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

export const Booking = mongoose.model('Booking', bookingSchema);
