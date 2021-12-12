const i_path = require('path');

module.exports = [{
   // target: ['web', 'es5'],
   target: 'node',
   mode: 'production',
   entry: './index.ts',
   module: {
      rules: [{
         test: /\.tsx?$/,
         use: 'ts-loader',
         exclude: /node_modules/
      }]
   },
   optimization: {
      minimize: true,
   },
   resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
   },
   output: {
      filename: 'index.js',
      path: i_path.resolve(__dirname, 'dist')
   },
   plugins: [
   ]
}];
