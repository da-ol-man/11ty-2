const path = require("path");
const WebpackAssetsManifest = require("webpack-assets-manifest");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("../../config/paths");
const autoprefixer = require("autoprefixer");
const ImageminWebpackPlugin = require("imagemin-webpack-plugin").default;
const ImageminWebP = require("imagemin-webp");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const tailwind = require("tailwindcss")(
	path.resolve(paths.config, "tailwind.config.js")
);
const purgecss = require("@fullhuman/postcss-purgecss")({
	content: [
		path.resolve(paths.src, "**/*.pug"),
		path.resolve(paths.src, "**/*.js"),
		path.resolve(paths.src, "**/*.json"),
		path.resolve(paths.src, "**/*.svg"),
	],
	defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
});

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
	entry: [
		path.resolve(paths.srcAssets, "js/main.js"),
		path.resolve(paths.srcAssets, "scss/main.scss"),
	],

	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
			{
				test: [/.css$|.scss$/],
				use: [
					MiniCssExtractPlugin.loader,
					{ loader: "css-loader", options: { importLoaders: 1 } },
					{
						loader: "postcss-loader",
						options: {
							ident: "postcss",
							parser: "postcss-scss",
							plugins: () => [
								tailwind,
								...(isProduction ? [autoprefixer, purgecss] : []),
							],
						},
					},
					{
						loader: "sass-loader",
					},
				],
			},
		],
	},
	plugins: [
		new WebpackAssetsManifest({
			output: path.resolve(paths.dist, "assets.json"),

			writeToDisk: true,
			apply(manifest) {
				manifest.set("year", new Date().getFullYear());
			},
		}),
		new WebpackAssetsManifest({
			output: path.resolve(paths.src, "11ty/_data/assets.json"),

			writeToDisk: true,
			apply(manifest) {
				manifest.set("year", new Date().getFullYear());
			},
		}),
		new CopyWebpackPlugin([
			{
				from: "./src/assets/images/**/*.{png,jpg,jpeg}",
				to: "./images/[folder]/[name].webp",
			},
		]),
		new webpack.HotModuleReplacementPlugin(),
		new ImageminWebpackPlugin({
			plugins: [
				ImageminWebP({
					quality: 75,
				}),
			],
		}),
	],
};
