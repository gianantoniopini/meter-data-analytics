import { fileURLToPath } from 'node:url'
import { mergeConfig, UserConfig, UserConfigFn } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfigCallback from './vite.config'

const viteConfig = viteConfigCallback as UserConfigFn

export default mergeConfig(
  viteConfig({ command: 'build', mode: 'test' }),
  defineConfig({
    test: {
      coverage: {
        enabled: true,
        thresholds: {
          lines: 94.37
        },
        reportsDirectory: './tests/unit/coverage'
      },
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      reporters: ['verbose'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['vitest.setup.ts']
    }
  }) as UserConfig
)
