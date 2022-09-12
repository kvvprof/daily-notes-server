import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
	destination(request, file, callback) {
		if (request.params.note_id) {
			callback(null, `../userFiles/${request.params.user_id}/notes/${request.params.note_id}`);
		} else {
			callback(null, `../userFiles/${request.params.user_id}/profile`);
		}
	},
	filename(request, file, callback) {
		callback(null, uuidv4() + path.extname(file.originalname));
	}
});

const types = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (request, file, callback) => {
	if (types.includes(file.mimetype)) {
		callback(null, true);
	} else {
		callback(null, false);
	}
};

export const upload = multer({ storage, fileFilter });
