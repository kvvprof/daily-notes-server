import { Router } from 'express';
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController.js';
import { verify } from '../middlewares/verifyMiddleware.js';

export const tagRouter = new Router();

tagRouter.get('/:user_id', verify, getTags);

tagRouter.post('/create-tag', verify, createTag);

tagRouter.put('/update-tag', verify, updateTag);

tagRouter.delete('/delete-tag/:tag_id', verify, deleteTag);
