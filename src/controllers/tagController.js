import { pool } from '../database.js';

export const getTags = async (request, response) => {
	const user_id = request.params.user_id;

	try {
		const tags = await pool.query('SELECT * FROM tags WHERE user_id = $1 ORDER BY tag_id DESC', [user_id]);

		return response.json(tags.rows);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const createTag = async (request, response) => {
	const tag = request.body;

	try {
		const newTag = await pool.query('INSERT INTO tags (name, user_id) VALUES ($1, $2) RETURNING *', [
			tag.name,
			tag.user_id
		]);

		return response.json(newTag.rows[0]);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const updateTag = async (request, response) => {
	const tag = request.body;

	try {
		await pool.query('UPDATE tags SET name = $1, color = $2, selected = $3 WHERE tag_id = $4', [
			tag.name,
			tag.color,
			tag.selected,
			tag.tag_id
		]);

		return response.json(`Тэг обновлен! ID: ${tag.tag_id}`);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const deleteTag = async (request, response) => {
	const tag_id = request.params.tag_id;

	try {
		await pool.query('DELETE FROM notes_tags WHERE tag_id = $1', [tag_id]);

		await pool.query('DELETE FROM tags WHERE tag_id = $1', [tag_id]);

		return response.json(`Тэг удален! ID: ${tag_id}`);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};
