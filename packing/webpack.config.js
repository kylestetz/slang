const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	entry: {
		app: './src/editor.js',
	},
	resolve: {
		symlinks: false,
	},
	output: {
		filename: 'slang.[name].js',
		path: path.resolve(__dirname, '../dist'),
		publicPath: '/',
		pathinfo: false,
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
			{
				test: /\.ohm$/,
				use: ['raw-loader'],
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: '/css',
							name: path.posix.join('/css', '[name].[ext]'),
						},
					},
					'css-loader',
				],
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				loader: 'file-loader',
				options: {
					limit: 100,
					name: path.posix.join('img', '[name].[ext]'),
				},
			},
			{
				test: /\.(mp3)$/,
				loader: 'file-loader',
				options: {
					limit: 10000,
					name: path.posix.join('audio', '[name].[ext]'),
				},
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/static/editor.html',
			title: 'SLANG',
			inject: true,
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
		}),
	],
};
