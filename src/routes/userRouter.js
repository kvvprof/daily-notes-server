import { Router } from 'express';
import { changeAvatar, login, logout, refreshTokens, registration } from '../controllers/userController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { verify } from '../middlewares/verifyMiddleware.js';

export const userRouter = new Router();

userRouter.post('/registration', registration);

userRouter.post('/login', login);

userRouter.delete('/logout', logout);

userRouter.get('/refresh-tokens', refreshTokens);

userRouter.put('/file-upload/avatar/:user_id', verify, upload.single('file'), changeAvatar);
