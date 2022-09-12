import { Router } from 'express';
import {
	createNote,
	deleteNote,
	getNotes,
	updateNote,
	addNoteTag,
	getNoteTags,
	deleteNoteTag,
	searchNotes,
	addPicture
} from '../controllers/noteController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { verify } from '../middlewares/verifyMiddleware.js';

export const noteRouter = new Router();

noteRouter.get('/create-note', verify, createNote);

noteRouter.get('/get-notes/:user_id/:offset/:is_archived', verify, getNotes);

noteRouter.get('/search-notes/:user_id/:offset/:is_archived/:title', verify, searchNotes);

noteRouter.put('/update-note', verify, updateNote);

noteRouter.put('/file-upload/note/:user_id/:note_id', verify, upload.single('file'), addPicture);

noteRouter.delete('/delete-note/:user_id/:note_id', verify, deleteNote);

noteRouter.get('/get-note-tags/:user_id', verify, getNoteTags);

noteRouter.post('/add-note-tag', verify, addNoteTag);

noteRouter.delete('/delete-note-tag/:tag_id/:note_id', verify, deleteNoteTag);
