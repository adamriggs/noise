const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    main: './src/main.js',
    styles: './src/main.scss',
  },
  output: {
    path: path.resolve(__dirname, 'assets'), // Output to Jekyll's assets folder
    filename: '[name].js',
	},
devtool: [
	{ type: "javascript", use: "source-map" },
	{ type: "css", use: "inline-source-map" },
],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS into separate files
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
	}),
	new LimitChunkCountPlugin({
		maxChunks: 1, // Set to 1 to disable code splitting into multiple files
	}),
  ],
};
