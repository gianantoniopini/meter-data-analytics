import { screen, queryAllByRole } from '@testing-library/vue';
import { renderComponent } from './helpers/MeterData.Helper';

const setup = (): void => {
  renderComponent();
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
