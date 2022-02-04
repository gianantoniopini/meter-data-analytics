import { fireEvent, render, screen } from '@testing-library/vue';
import MeterData from '../MeterData.vue';

const setup = (): {
  smartMeterIdFilter: HTMLElement;
  applyButton: HTMLElement;
} => {
  render(MeterData);

  const smartMeterIdFilter = screen.getByRole('textbox', {
    name: 'Smart Meter Id:'
  });
  const applyButton = screen.getByRole('button', {
    name: 'Apply'
  });

  return { smartMeterIdFilter, applyButton };
};

describe('if Smart Meter Id filter is cleared', () => {
  it('gives validation error', async () => {
    const { smartMeterIdFilter } = setup();

    await fireEvent.update(smartMeterIdFilter, '');

    expect(smartMeterIdFilter.title).toEqual('Value is required');
  });

  it('disables Apply button', async () => {
    const { smartMeterIdFilter, applyButton } = setup();

    await fireEvent.update(smartMeterIdFilter, '');

    expect(applyButton).toBeDisabled();
  });
});

describe('if Smart Meter Id filter is updated with a value', () => {
  const smartMeterIdFilterValue = 'abcd-1234';

  it('does not give validation error', async () => {
    const { smartMeterIdFilter } = setup();

    await fireEvent.update(smartMeterIdFilter, '');
    await fireEvent.update(smartMeterIdFilter, smartMeterIdFilterValue);

    expect(smartMeterIdFilter.title).toHaveLength(0);
  });

  it('enables Apply button', async () => {
    const { smartMeterIdFilter, applyButton } = setup();

    await fireEvent.update(smartMeterIdFilter, '');
    await fireEvent.update(smartMeterIdFilter, smartMeterIdFilterValue);

    expect(applyButton).toBeEnabled();
  });
});
