import { render, screen, queryAllByRole } from '@testing-library/vue';
import MeterData from '../MeterData.vue';

const setup = (): void => {
  render(MeterData);
};

it('renders sidebar menu', () => {
  setup();

  const navigation = screen.queryByRole('navigation');
  expect(navigation).toBeInTheDocument();
  const navigationLinks = queryAllByRole(navigation as HTMLElement, 'link');
  expect(navigationLinks).toHaveLength(4);
  expect(navigationLinks[0].title).toEqual('Filters');
  expect(navigationLinks[1].title).toEqual('Time Series');
  expect(navigationLinks[2].title).toEqual('Analytics');
  expect(navigationLinks[3].title).toEqual('Raw Data');
});

it('sets default value for Smart Meter Id filter', () => {
  setup();
  const expectedValue = process.env.VUE_APP_DEFAULT_SMART_METER_ID;

  const smartMeterIdFilter = screen.queryByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  expect(smartMeterIdFilter).toBeInTheDocument();
  expect(smartMeterIdFilter).toHaveDisplayValue(expectedValue);
});
