import { Router } from 'express';

import { noteRouter } from './noteRouter.js';
import { tagRouter } from './tagRouter.js';
import { userRouter } from './userRouter.js';

export const router = new Router();

router.use('/user', userRouter);
router.use('/note', noteRouter);
router.use('/tag', tagRouter);
