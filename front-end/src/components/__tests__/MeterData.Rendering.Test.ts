import { render, screen, queryAllByRole } from '@testing-library/vue';
import MeterData from '../MeterData.vue';

const setup = (): void => {
  render(MeterData);
};

it('renders Sidebar menu', () => {
  setup();

  const navigation = screen.queryByRole('navigation');
  expect(navigation).toBeInTheDocument();
  const navigationLinks = queryAllByRole(navigation as HTMLElement, 'link');
  expect(navigationLinks).toHaveLength(4);
  expect(navigationLinks[0]).toHaveTextContent('Filters');
  expect(navigationLinks[1]).toHaveTextContent('Time Series');
  expect(navigationLinks[2]).toHaveTextContent('Analytics');
  expect(navigationLinks[3]).toHaveTextContent('Raw Data');
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
