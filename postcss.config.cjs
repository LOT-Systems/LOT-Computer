module.exports = {
  plugins: {
    'tailwindcss': {},
    'postcss-import': {},
    'postcss-nesting': {},
    'autoprefixer': {},
    'cssnano': {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
      }],
    },
  }
}