module.exports = (ctx) => ({
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(ctx.env === 'production' ? { cssnano: {} } : {}),
  },
})
