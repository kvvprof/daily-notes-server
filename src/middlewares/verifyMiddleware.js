import jwt from 'jsonwebtoken'

export const verify = (request, response, next) => {
	try {
		const token = request.headers.authorization.split(' ')[1]

		if (!token) {
			return response.status(403).json('Пользователь не авторизован')
		}

		const verify = jwt.verify(token, process.env.APP_ACCESS_SECRET_KEY)

		request.user = verify.user

		next()
	} catch (error) {
		response.status(403).json('Пользователь не авторизован')
	}
}
