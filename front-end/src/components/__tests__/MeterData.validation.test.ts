import { fireEvent, render, screen } from '@testing-library/vue';
import MeterData from '../MeterData.vue';

const setup = async (smartMeterIdFilterValue: string): Promise<HTMLElement> => {
  render(MeterData);

  const smartMeterIdFilter = screen.getByRole('textbox', {
    name: 'Smart Meter Id:'
  });

  await fireEvent.update(smartMeterIdFilter, smartMeterIdFilterValue);

  return smartMeterIdFilter;
};

describe('if Smart Meter Id filter is cleared', () => {
  it('gives validation error', async () => {
    const smartMeterIdFilter = await setup('');

    expect(smartMeterIdFilter.title).toEqual('Value is required');
  });

  it('disables Apply button', async () => {
    await setup('');
    const applyButton = screen.getByRole('button', {
      name: 'Apply'
    });

    expect(applyButton).toBeDisabled();
  });
});
