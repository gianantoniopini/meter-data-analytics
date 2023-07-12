import { fileURLToPath } from 'node:url'
import { mergeConfig, UserConfig, UserConfigFn } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfigCallback from './vite.config'

const viteConfig = viteConfigCallback as UserConfigFn

export default mergeConfig(
  viteConfig({ command: 'build', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      setupFiles: ['vitest.setup.ts'],
      transformMode: {
        web: [/\.[jt]sx$/]
      }
    }
  }) as UserConfig
)
