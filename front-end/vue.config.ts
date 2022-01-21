import { constants } from 'zlib';

export const devServer = {
  port: process.env.VUE_APP_DEV_SERVER_PORT
};

export const lintOnSave = false;

export const pages = {
  index: {
    entry: 'src/main.ts',
    title: 'MEVN Stack App'
  }
};

export const pluginOptions = {
  compression: {
    brotli: {
      filename: '[file].br[query]',
      algorithm: 'brotliCompress',
      include: /\.(js|css|html|svg|json)(\?.*)?$/i,
      compressionOptions: {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11
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
};
