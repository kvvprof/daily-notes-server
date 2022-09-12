import path from 'path';
import Dotenv from 'dotenv-webpack';
import webpackNodeExternals from 'webpack-node-externals';

const __dirname = path.resolve();

const config = {
	mode: 'production',
	entry: './src/index.js',
	target: 'node',
	externals: [webpackNodeExternals()],
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'backend.js'
	},
	resolve: {
		extensions: ['.js']
	},
	plugins: [new Dotenv()]
};

export default config;
