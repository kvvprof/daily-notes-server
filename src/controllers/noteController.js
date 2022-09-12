import { pool } from '../database.js';
import { createNoteFolder, deleteNoteFolder } from '../services/fileService.js';

export const getNotes = async (request, response) => {
	const user_id = request.params.user_id;
	const is_archived = request.params.is_archived;
	const limit = process.env.NOTE_LIMIT;
	const offset = request.params.offset;

	try {
		let notes;
		const selectedTags = await pool.query('SELECT tag_id FROM tags WHERE selected = true');

		if (selectedTags.rows.length) {
			notes = await pool.query(
				`SELECT DISTINCT ON (n.updated_at) *
				FROM notes n
   			LEFT OUTER JOIN notes_tags nt
      	ON n.note_id = nt.note_id
   			LEFT OUTER JOIN tags t 
      	ON nt.tag_id = t.tag_id
				WHERE n.user_id = $1 
				AND t.selected = true 
				AND n.is_archived = $2 
				ORDER BY n.updated_at DESC 
				OFFSET $3 
				LIMIT $4`,
				[user_id, is_archived, offset, limit]
			);
		} else {
			notes = await pool.query(
				`SELECT * 
				FROM notes 
				WHERE user_id = $1 
				AND is_archived = $2 
				ORDER BY updated_at DESC 
				OFFSET $3 
				LIMIT $4`,
				[user_id, is_archived, offset, limit]
			);
		}

		return response.json(notes.rows);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const searchNotes = async (request, response) => {
	const user_id = request.params.user_id;
	const is_archived = request.params.is_archived;
	const limit = process.env.NOTE_LIMIT;
	const offset = request.params.offset;

	const title_abc = request.params.title.toLowerCase();
	const title_ABC = request.params.title.toUpperCase();
	const title_Abc = request.params.title[0].toUpperCase() + request.params.title.slice(1);

	try {
		let notes;
		const selectedTags = await pool.query('SELECT tag_id FROM tags WHERE selected = true');

		if (selectedTags.rows.length) {
			notes = await pool.query(
				`SELECT DISTINCT ON (n.updated_at) *
				FROM notes n
   			LEFT OUTER JOIN notes_tags nt
      	ON n.note_id = nt.note_id
   			LEFT OUTER JOIN tags t 
      	ON nt.tag_id = t.tag_id
				WHERE n.title 
				LIKE ANY(ARRAY['%'||$1||'%', '%'||$2||'%', '%'||$3||'%']) 
				AND n.user_id = $4 
				AND n.is_archived = $5
				AND t.selected = true  
				ORDER BY n.updated_at DESC 
				OFFSET $6 
				LIMIT $7`,
				[title_abc, title_ABC, title_Abc, user_id, is_archived, offset, limit]
			);
		} else {
			notes = await pool.query(
				`SELECT * 
				FROM notes 
				WHERE title 
				LIKE ANY(ARRAY['%'||$1||'%', '%'||$2||'%', '%'||$3||'%']) 
				AND user_id = $4 
				AND is_archived = $5 
				ORDER BY updated_at DESC 
				OFFSET $6 
				LIMIT $7`,
				[title_abc, title_ABC, title_Abc, user_id, is_archived, offset, limit]
			);
		}

		return response.json(notes.rows);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const createNote = async (request, response) => {
	const user_id = request.user.user_id;
	const blocks = {};
	const updated_at = Math.floor(Date.now() / 1000);

	try {
		const note = await pool.query('INSERT INTO notes (user_id, blocks, updated_at) VALUES ($1, $2, $3) RETURNING *', [
			user_id,
			blocks,
			updated_at
		]);

		createNoteFolder(user_id, note.rows[0].note_id);

		return response.json(note.rows[0]);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const updateNote = async (request, response) => {
	const note = request.body;
	const updated_at = Math.floor(Date.now() / 1000);

	try {
		const updatedNote = await pool.query(
			'UPDATE notes SET title = $1, blocks = $2, is_archived = $3, updated_at = $4 WHERE note_id = $5 RETURNING *',
			[note.title, note.blocks, note.is_archived, updated_at, note.note_id]
		);

		return response.json(updatedNote.rows[0]);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const addPicture = async (request, response) => {
	if (!request.file) {
		response.status(500).json('Ошибка при загрузке файла. Допустимые форматы: png, jpeg, jpg');
	} else {
		try {
			const filename = request.file.filename;

			response.json(filename);
		} catch (error) {
			response.status(500).json('Ошибка сервера. Попробуйте позже');
		}
	}
};

export const deleteNote = async (request, response) => {
	const user_id = request.params.user_id;
	const note_id = request.params.note_id;

	try {
		await pool.query('DELETE FROM notes_tags WHERE note_id = $1', [note_id]);

		await pool.query('DELETE FROM notes WHERE note_id = $1', [note_id]);

		deleteNoteFolder(user_id, note_id);

		return response.json(`Заметка удалена! ID: ${note_id}`);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const getNoteTags = async (request, response) => {
	const user_id = request.params.user_id;

	try {
		const tags = await pool.query(
			`SELECT 
				n.note_id, 
				t.tag_id, name, 
				color 
			FROM notes n 
			LEFT OUTER JOIN notes_tags nt 
			ON n.note_id = nt.note_id 
			LEFT OUTER JOIN tags t 
			ON nt.tag_id = t.tag_id 
			WHERE t.user_id = $1`,
			[user_id]
		);

		return response.json(tags.rows);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const addNoteTag = async (request, response) => {
	const data = request.body;

	try {
		await pool.query('INSERT INTO notes_tags (note_id, tag_id) VALUES ($1, $2)', [data.note_id, data.tag_id]);

		return response.json(`Тег добавлен!`);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const deleteNoteTag = async (request, response) => {
	const { tag_id, note_id } = request.params;

	try {
		await pool.query('DELETE FROM notes_tags WHERE tag_id = $1 AND note_id = $2', [tag_id, note_id]);

		return response.json(`Тег удален!`);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};
