import { render, screen, queryAllByRole } from '@testing-library/vue';
import MeterData from '../MeterData.vue';

const setup = (): void => {
  render(MeterData);
};

it('renders Sidebar menu', () => {
  setup();

  const navigation = screen.queryByRole('navigation');
  expect(navigation).toBeInTheDocument();
  const sidebarMenuLinks = queryAllByRole(navigation as HTMLElement, 'link');
  expect(sidebarMenuLinks).toHaveLength(4);
  expect(sidebarMenuLinks[0]).toHaveTextContent('Filters');
  expect(sidebarMenuLinks[1]).toHaveTextContent('Time Series');
  expect(sidebarMenuLinks[2]).toHaveTextContent('Analytics');
  expect(sidebarMenuLinks[3]).toHaveTextContent('Raw Data');
});

it('renders Smart Meter Id filter with default value', () => {
  setup();
  const expectedValue = process.env.VUE_APP_DEFAULT_SMART_METER_ID;

  const smartMeterIdFilter = screen.queryByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  expect(smartMeterIdFilter).toBeInTheDocument();
  expect(smartMeterIdFilter).toHaveDisplayValue(expectedValue);
});
