// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { Users } from '../models/user-model.js';
import { catchAsync } from '../utils/catch-async.js';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';
import { promisify } from 'util';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { Email } from '../utils/email.js';

// Validação manual e garantias de tipo
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN as `${number}${
  | 'd'
  | 'h'
  | 'm'
  | 's'}`;

if (!jwtSecret || !jwtExpiresIn) {
  throw new Error('JWT_SECRET or JWT_EXPIRES_IN not defined in environment');
}

const signToken = (id: string) => {
  const signOptions: SignOptions = {
    expiresIn: jwtExpiresIn,
  };
  return jwt.sign({ id }, jwtSecret, signOptions);
};

const createSendToken = (user, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());

  const cookiesOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIES_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'lax',
  };
  // if (process.env.NODE_ENV === 'production')
  cookiesOptions.secure = false; // ⚠️ Apenas para dev!

  res.cookie('jwt', token, cookiesOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    // Send welcome email
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please Provide email and password!', 400));
    }

    // 2) check if user exists && password is correct
    const user = await Users.findOne({ email }).select('+password');

    // @ts-ignore
    if (!user || !(await user?.correctPassword(password, user?.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
  }
);

export const protectRoute = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) getting token and check of it's there

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await Users.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // get user based on Posted email
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  const resetToken = user.generatePasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Sent it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending the email. Try again later', 500)
    );
  }
};

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await Users.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user?.save();
    //3) Update changedPasswordAt property for the user

    //4) Log the user in, send JWT

    createSendToken(user, 200, res);
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1 - Get the user from collection

    const user = await Users.findById(req.user._id.toString()).select([
      '+password',
      '+passwordConfirm',
    ]);

    if (!user) {
      return next(new AppError('Cannot find any user', 404));
    }

    // 2 - Check if the POSTed password is correct.
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!(await user?.correctPassword(oldPassword, user?.password))) {
      return next(new AppError('Your current password is wrong', 401));
    }

    // 3 - If so, update password

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // 4) Log user in, send JWT

    createSendToken(user, 200, res);
  }
);

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await Users.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
