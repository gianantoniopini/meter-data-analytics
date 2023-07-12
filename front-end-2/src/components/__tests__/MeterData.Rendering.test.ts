import { describe, it, expect } from 'vitest'
import { queryAllByRole, screen } from '@testing-library/vue'
import { renderComponent } from './helpers/MeterData.Helper'

const setup = (): void => {
  renderComponent()
}

describe('MeterData', () => {
  it('renders Sidebar menu', () => {
    setup()

    const navigation = screen.queryByRole('navigation')
    expect(navigation).not.toBeNull()
    const sidebarMenuLinks = queryAllByRole(navigation as HTMLElement, 'link')
    expect(sidebarMenuLinks).toHaveLength(4)
    expect(sidebarMenuLinks[0].textContent).toEqual('Filters')
    expect(sidebarMenuLinks[1].textContent).toEqual('Time Series')
    expect(sidebarMenuLinks[2].textContent).toEqual('Analytics')
    expect(sidebarMenuLinks[3].textContent).toEqual('Raw Data')
  })

  it('renders Smart Meter Id filter with default value', () => {
    setup()
    const expectedValue = process.env.VITE_DEFAULT_SMART_METER_ID

    const smartMeterIdFilter = screen.queryByRole('textbox', {
      name: 'Smart Meter Id:'
    })
    expect(smartMeterIdFilter).not.toBeNull()
    expect(smartMeterIdFilter?.textContent).toEqual(expectedValue)
  })
})
