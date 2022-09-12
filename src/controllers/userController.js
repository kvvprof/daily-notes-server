import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../database.js';
import { saveTokens } from '../services/tokenService.js';
import { createDefaultUserFolders, deleteOldFile } from '../services/fileService.js';
import jwt from 'jsonwebtoken';

export const registration = async (request, response) => {
	const { username, email, password } = request.body;

	const created_at = Math.floor(Date.now() / 1000);

	try {
		const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		if (user.rows.length > 0) {
			return response.status(401).json(`Пользователь с почтой ${email} уже зарегистрирован`);
		}

		const salt = await bcrypt.genSalt(10);
		const bcryptPassword = await bcrypt.hash(password, salt);

		const newUser = await pool.query(
			'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
			[username, email, bcryptPassword, created_at]
		);

		createDefaultUserFolders(newUser.rows[0].user_id);

		saveTokens(response, newUser.rows[0]);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const login = async (request, response) => {
	const { email, password } = request.body;

	try {
		const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

		if (user.rows.length === 0) {
			return response.status(401).json('Некорректный адрес электронной почты');
		}

		const validPassword = await bcrypt.compare(password, user.rows[0].password);

		if (!validPassword) {
			return response.status(401).json('Некорректный пароль');
		}

		saveTokens(response, user.rows[0]);
	} catch (error) {
		console.log(error);
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const logout = async (request, response) => {
	const { refresh_token } = request.cookies;

	try {
		await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);

		return response.json(`logout`);
	} catch (error) {
		response.status(500).json('Ошибка сервера. Попробуйте позже');
	}
};

export const refreshTokens = async (request, response) => {
	const { refresh_token } = request.cookies;

	try {
		const verify = jwt.verify(refresh_token, process.env.APP_REFRESH_SECRET_KEY);

		const token = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [refresh_token]);

		if (token.rows.length === 0) {
			return response.status(403).json('Ошибка авторизации');
		}

		await saveTokens(response, verify.user);

		await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
	} catch (error) {
		response.status(403).json('Ошибка авторизации');
	}
};

export const changeAvatar = async (request, response) => {
	if (!request.file) {
		response.status(500).json('Ошибка при загрузке файла. Доступные форматы: png, jpeg, jpg. Макс. размер 2 мб.');
	} else {
		const user_id = request.params.user_id;
		const filename = request.file.filename;

		try {
			const oldAvatar = await pool.query('SELECT avatar FROM users WHERE user_id = $1', [user_id]);

			const avatar = await pool.query('UPDATE users SET avatar = $1 WHERE user_id = $2 RETURNING avatar', [
				filename,
				user_id
			]);

			if (oldAvatar.rows[0].avatar !== '') {
				deleteOldFile(user_id, 'profile', oldAvatar.rows[0].avatar);
			}

			response.json(avatar.rows[0].avatar);
		} catch (error) {
			response.status(500).json('Ошибка сервера. Попробуйте позже');
		}
	}
};
