// @ts-nocheck
import express from 'express';
import {
  forgotPassword,
  login,
  protectRoute,
  resetPassword,
  signup,
  restrictTo,
  updatePassword,
  logout,
} from '../controllers/auth-controller.js';
import {
  deleteMe,
  getAllUsers,
  createUser,
  updateMe,
  updateUser,
  getUser,
  getMe,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/user-controller.js';

// Roteador com tipagem correta
export const userRouter: Router = express.Router();

userRouter.post('/signup', signup);

userRouter.post('/login', login);
userRouter.get('/logout', logout);

userRouter.post('/forgot-password', forgotPassword);

userRouter.patch('/reset-password/:token', resetPassword);

userRouter.use(protectRoute); // Protege todas as rotas abaixo
userRouter.get('/me', getMe, getUser); // Rota para obter o usuário logado
userRouter.patch('/update-password', updatePassword);
userRouter.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.delete('/delete-me', deleteMe);

userRouter.use(restrictTo('admin')); // Protege as rotas abaixo para usuários com permissão de admin

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
