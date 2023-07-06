import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import TheHome from '../TheHome.vue'
import { setupI18n } from '@/i18n'

describe('TheHome', () => {
  it('renders welcome message', () => {
    render(TheHome, {
      global: {
        plugins: [setupI18n()]
      }
    })

    expect(
      screen.queryByRole('heading', {
        name: 'Welcome to the Meter Data Analytics app.'
      })
    ).not.toBeNull()
  })
})
