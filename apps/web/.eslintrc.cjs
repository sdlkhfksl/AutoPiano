module.exports = {
  root: true,
  extends: ['@nuxt/eslint-config', 'prettier'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  }
}
