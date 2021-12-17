module.exports = {
  devServer: {
    port: process.env.VUE_APP_DEV_SERVER_PORT
  },
  lintOnSave: false,
  pages: {
    index: {
      entry: 'src/main.ts',
      title: 'MEVN Stack App'
    }
  }
};
