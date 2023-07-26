import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'
import { setupI18n } from '@/i18n'
import router from '@/router'

const setup = async () => {
  const component = mount(App, { global: { plugins: [setupI18n(), router] } })

  await router.isReady()

  return component
}

describe('App', () => {
  it('sets page title', async () => {
    await setup()

    expect(document.title).toBe('Meter Data Analytics')
  })

  it('renders Navbar menu', async () => {
    const wrapper = await setup()

    const navigationLinks = wrapper.findAll('.navbar a')
    expect(navigationLinks).toHaveLength(4)
    expect(navigationLinks[0].element.textContent).toContain('Meter Data Analytics')
    expect(navigationLinks[1].element.textContent).toBe('Home')
    expect(navigationLinks[2].element.textContent).toBe('Meter Data')
    expect(navigationLinks[3].element.textContent).toBe('Settings')
  })

  it('renders welcome message', async () => {
    const wrapper = await setup()

    const heading = wrapper.get('h1')
    expect(heading.element.textContent).toBe('Welcome to the Meter Data Analytics app.')
  })
})
