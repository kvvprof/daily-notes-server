import fs from 'fs';
import path from 'path';

export const createDefaultUserFolders = (user_id) => {
	const __dirname = path.resolve();

	try {
		fs.mkdir(path.resolve(__dirname, `../userFiles/${user_id}/profile`), { recursive: true }, (error) => {
			if (error) throw error;
		});

		fs.mkdir(path.resolve(__dirname, `../userFiles/${user_id}/notes`), { recursive: true }, (error) => {
			if (error) throw error;
		});
	} catch (error) {
		console.log(error);
	}
};

export const deleteOldFile = (user_id, folder, filename) => {
	const __dirname = path.resolve();

	try {
		fs.rmSync(
			path.resolve(__dirname, `../userFiles/${user_id}/${folder}/${filename}`),
			{ recursive: true, force: true },
			(error) => {
				if (error) throw error;
			}
		);
	} catch (error) {
		console.log(error);
	}
};

export const createNoteFolder = (user_id, note_id) => {
	const __dirname = path.resolve();

	try {
		fs.mkdir(path.resolve(__dirname, `../userFiles/${user_id}/notes/${note_id}`), { recursive: true }, (error) => {
			if (error) throw error;
		});
	} catch (error) {
		console.log(error);
	}
};

export const deleteNoteFolder = (user_id, note_id) => {
	const __dirname = path.resolve();

	try {
		fs.rmSync(
			path.resolve(__dirname, `../userFiles/${user_id}/notes/${note_id}`),
			{ recursive: true, force: true },
			(error) => {
				if (error) throw error;
			}
		);
	} catch (error) {
		console.log(error);
	}
};
