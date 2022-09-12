import jwt from 'jsonwebtoken';
import { pool } from '../database.js';

export const generateTokens = (user_id, username, email) => {
	const payload = {
		user: {
			user_id,
			username,
			email
		}
	};

	const refreshToken = jwt.sign(payload, process.env.APP_REFRESH_SECRET_KEY, { expiresIn: '15d' });
	const accessToken = jwt.sign(payload, process.env.APP_ACCESS_SECRET_KEY, { expiresIn: '15m' });

	return { refreshToken, accessToken };
};

export const saveTokens = async (response, user) => {
	const { refreshToken, accessToken } = generateTokens(user.user_id, user.username, user.email);

	await pool.query('INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2) RETURNING *', [
		refreshToken,
		user.user_id
	]);

	await response.cookie('refresh_token', refreshToken, {
		maxAge: 15 * 24 * 60 * 60 * 1000,
		httpOnly: true
	});

	const currentUser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);

	return response.json({ accessToken, refreshToken, currentUser: currentUser.rows[0] });
};
