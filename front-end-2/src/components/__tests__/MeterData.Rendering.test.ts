import { describe, it, expect } from 'vitest'
import { mountComponent } from './helpers/MeterData.Helper'

const setup = () => {
  return mountComponent()
}

describe('MeterData', () => {
  it('renders Sidebar menu', () => {
    const wrapper = setup()

    const sidebarMenuLinks = wrapper.findAll('.nav-link')
    expect(sidebarMenuLinks).toHaveLength(4)
    expect(sidebarMenuLinks[0].element.text).toBe('Filters')
    expect(sidebarMenuLinks[1].element.text).toBe('Time Series')
    expect(sidebarMenuLinks[2].element.text).toBe('Analytics')
    expect(sidebarMenuLinks[3].element.text).toBe('Raw Data')
  })

  it('renders Smart Meter Id filter with default value', () => {
    const expectedValue = process.env.VITE_DEFAULT_SMART_METER_ID

    const wrapper = setup()

    const smartMeterIdFilter = wrapper.get('input#smartMeterIdFilter')
    expect(smartMeterIdFilter.element.value).toBe(expectedValue)
  })
})
