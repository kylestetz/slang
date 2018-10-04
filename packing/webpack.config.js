const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
      app: './src/editor.js',
  },
  resolve: {
      symlinks: false
  },
  output: {
    filename: 'slang.[name].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    pathinfo: false
  },
  module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '/css',
                name: path.posix.join('/css', '[name].[ext]'),
              }
            },
            "css-loader"
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          loader: 'file-loader',
          options: {
            limit: 100,
            name: path.posix.join('img', '[name].[ext]'),
          }
        },
        {
          test: /\.(mp3)$/,
          loader: 'file-loader',
          options: {
            limit: 10000,
            name: path.posix.join('audio', '[name].[ext]'),
          }
        },
      ]
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
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
};

/* 
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    main: [
      './src/editor.js',
    ],
  },
  output: {
    filename: 'slang.[name].js',
    path: path.resolve(__dirname, '../dist'),
  },
  resolve: {
      symlinks: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('/img', '[name].[ext]'),
        }
      },
      {
        test: /\.(mp3)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: path.posix.join('/audio', '[name].[ext]'),
        }
      },
    ]
  },
  plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/static/editor.html',
        title: 'SLANG',
        inject: true,
      }),
      new FriendlyErrorsPlugin(),
      new MiniCssExtractPlugin({
          filename: "[name].css",
      }),
  ],
};
*/