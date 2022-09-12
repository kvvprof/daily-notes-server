import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import { router } from './routes/index.js';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const port = process.env.APP_PORT;

app.use(cookieParser());
app.use('/userFiles', express.static(path.join(path.resolve(), '../userFiles')));
app.use('/', express.static(path.join(path.resolve(), '../public')));
app.use(json());
app.use(
	cors({
		credentials: true,
		origin: true
	})
);
app.use('/api', router);

try {
	app.listen(port, () => {
		console.log(`Server started. Port: ${port}.`);
	});
} catch (error) {
	console.log(error);
}
