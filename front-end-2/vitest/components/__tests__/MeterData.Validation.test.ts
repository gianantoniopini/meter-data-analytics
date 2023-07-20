import { describe, it, expect } from 'vitest'
import { mountComponent } from './helpers/MeterData.Helper'

const setup = () => {
  const wrapper = mountComponent()

  const smartMeterIdFilter = wrapper.get('input#smartMeterIdFilter')
  const applyButton = wrapper.get('button')

  return { wrapper, smartMeterIdFilter, applyButton }
}

const smartMeterIdFilterValidationError = 'Smart Meter Id filter is required'

describe('MeterData', () => {
  describe('if Smart Meter Id filter is cleared', () => {
    it('renders validation error', async () => {
      const { wrapper, smartMeterIdFilter } = setup()

      await smartMeterIdFilter.setValue('')

      const validationErrorWrapper = wrapper.get('.invalid-feedback')
      expect(validationErrorWrapper.element.textContent).toBe(smartMeterIdFilterValidationError)
    })

    it('disables Apply button', async () => {
      const { smartMeterIdFilter, applyButton } = setup()

      await smartMeterIdFilter.setValue('')

      expect(applyButton.attributes()).toHaveProperty('disabled')
    })
  })

  describe('if Smart Meter Id filter is updated with a value', () => {
    const smartMeterIdFilterValue = 'abcd-1234'

    it('does not render validation error', async () => {
      const { wrapper, smartMeterIdFilter } = setup()

      await smartMeterIdFilter.setValue('')
      await smartMeterIdFilter.setValue(smartMeterIdFilterValue)

      const validationErrorWrapper = wrapper.get('.invalid-feedback')
      expect(validationErrorWrapper.element.textContent).toBe('')
    })

    it('enables Apply button', async () => {
      const { smartMeterIdFilter, applyButton } = setup()

      await smartMeterIdFilter.setValue('')
      await smartMeterIdFilter.setValue(smartMeterIdFilterValue)

      expect(applyButton.attributes()).not.toHaveProperty('disabled')
    })
  })
})
