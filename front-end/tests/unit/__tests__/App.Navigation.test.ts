import { describe, it, expect, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import VueDatePicker from '@vuepic/vue-datepicker'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import { setupI18n } from '@/i18n'
import router from '@/router'

const setup = async () => {
  const component = mount(App, {
    global: { plugins: [createPinia(), setupI18n(), router], components: { VueDatePicker } }
  })

  await router.isReady()

  return component
}

describe('App', () => {
  it('can navigate to Meter Data', async () => {
    const wrapper = await setup()
    const meterDataLink = wrapper
      .findAll('.nav-link')
      .find((element) => element.text() === 'Meter Data')

    await meterDataLink?.trigger('click')
    await flushPromises()

    const heading = wrapper.get('h4')
    expect(heading.element.textContent).toBe('Meter Data')
  })

  it('can navigate to Settings', async () => {
    const wrapper = await setup()
    const settingsLink = wrapper
      .findAll('.nav-link')
      .find((element) => element.text() === 'Settings')

    await settingsLink?.trigger('click')
    await flushPromises()

    const heading = wrapper.get('h4')
    expect(heading.element.textContent).toBe('Settings')
  })

  it('can navigate back to Home after navigating to Settings', async () => {
    const wrapper = await setup()
    const settingsLink = wrapper
      .findAll('.nav-link')
      .find((element) => element.text() === 'Settings')
    await settingsLink?.trigger('click')
    await flushPromises()

    const settingsHeading = wrapper.get('h4')
    expect(settingsHeading.element.textContent).toBe('Settings')

    const homeLink = wrapper.findAll('.nav-link').find((element) => element.text() === 'Home')
    await homeLink?.trigger('click')
    await flushPromises()

    const homeHeading = wrapper.get('h1')
    expect(homeHeading.element.textContent).toBe('Welcome to the Meter Data Analytics app.')
  })
})

afterEach(async () => {
  await router.push({ name: 'home' })
})
