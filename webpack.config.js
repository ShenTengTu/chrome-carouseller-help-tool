"use strict";
const fs = require('fs');
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isDev = (process.env.NODE_ENV == 'development');
console.log(process.env.NODE_ENV,isDev);
const {
  NoEmitOnErrorsPlugin
} = require('webpack');

const {
  CommonsChunkPlugin,
  UglifyJsPlugin
} = require('webpack').optimize;

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
  filename: (getPath) => {
      return getPath("../css/[name].css").replace("_less","");
    },
  allChunks:true
});

const nodeModules = path.join(process.cwd(), 'node_modules');
const realNodeModules = fs.realpathSync(nodeModules);
const genDirNodeModules = path.join(process.cwd(), 'src', '$$_gendir', 'node_modules');
const scriptsModules = path.join(process.cwd(), 'src/js/class');

var config = {
  devtool: "source-map",
  resolve: {
    extensions: [".js",".less"],
    modules: ["./node_modules"]
  },
  context: path.join(process.cwd(), 'src'),
  entry: {
    content: "./js/content.js",
    background: "./js/background.js",
    content_less:"./less/content.less",
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
    path: path.join(process.cwd(), isDev?"build/js":"dist/js")
  },
  module: {
    rules: [{
        loader: "source-map-loader",
        enforce: "pre",
        test: /\.js$/,
        exclude: [/\/node_modules\//]
      },
      {
        loader: "json-loader",
        test: /\.json$/,
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc:false,
            presets: ['env'],
            plugins: ['transform-runtime']
          }
        }
      },
      {
        test: /\.less$/,
        use: extractLess.extract({
          use: [{
              loader: "css-loader",
              options: {
                sourceMap: isDev,
                minimize: !isDev ? {preset: 'default'} : false,
              }
            },
            {
              loader: "less-loader",
              options: {
                sourceMap: isDev,
                paths: [path.join(process.cwd(), 'node_modules')]//less path
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    extractLess,
    new NoEmitOnErrorsPlugin(),
    new CommonsChunkPlugin({
      name: ["vendor"], //for lib or framework vendor
      minChunks: (module) => {
        return module.resource &&
          (module.resource.startsWith(nodeModules) ||
            module.resource.startsWith(genDirNodeModules) ||
            module.resource.startsWith(realNodeModules)
          );
      },
      chunks: ["content", "background"]
    }),
    new CommonsChunkPlugin({
      name: ["common"], //for custom shared scripts
      minChunks: (module) => {
        return module.resource && module.resource.startsWith(scriptsModules);
      },
      chunks: ["content", "background"]
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(process.cwd(), 'assets/img'),
        to: path.join(process.cwd(), isDev?"build/img":"dist/img")
      },
      {
        from: path.join(process.cwd(), 'src/_locales'),
        to: path.join(process.cwd(), isDev?"build/_locales":"dist/_locales")
      }
    ])
  ]
};

if(!isDev){
  config.plugins.push(new UglifyJsPlugin());
  delete config.devtool;
}

module.exports = config;
