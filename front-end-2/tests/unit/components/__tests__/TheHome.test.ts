import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheHome from '@/components/TheHome.vue'
import { setupI18n } from '@/i18n'

describe('TheHome', () => {
  it('renders welcome message', () => {
    const wrapper = mount(TheHome, {
      global: {
        plugins: [setupI18n()]
      }
    })

    const heading = wrapper.get('h1')
    expect(heading.element.textContent).toBe('Welcome to the Meter Data Analytics app.')
  })
})
