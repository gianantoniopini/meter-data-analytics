// eslint-disable-next-line @typescript-eslint/no-var-requires
const zlib = require('zlib');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared/src')
      }
    }
  },
  devServer: {
    port: process.env.VUE_APP_DEV_SERVER_PORT
  },
  lintOnSave: false,
  pages: {
    index: {
      entry: 'src/main.ts',
      title: 'Meter Data Analytics'
    }
  },
  pluginOptions: {
    compression: {
      brotli: {
        filename: '[file].br[query]',
        algorithm: 'brotliCompress',
        include: /\.(js|css|html|svg|json)(\?.*)?$/i,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11
          }
        },
        minRatio: 0.8
      },
      gzip: {
        filename: '[file].gz[query]',
        algorithm: 'gzip',
        include: /\.(js|css|html|svg|json)(\?.*)?$/i,
        minRatio: 0.8
      }
    }
  }
};
