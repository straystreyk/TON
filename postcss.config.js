module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-advanced-variables'),
    require('postcss-nested'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('autoprefixer') : '',
  ],
}
