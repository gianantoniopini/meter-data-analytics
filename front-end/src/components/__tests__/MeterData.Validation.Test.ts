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

const smartMeterIdFilterValidationError = "'Smart Meter Id' filter is required";

describe('if Smart Meter Id filter is cleared', () => {
  it('renders validation error', async () => {
    const { smartMeterIdFilter } = setup();

    await fireEvent.update(smartMeterIdFilter, '');

    const validationError = screen
      .queryAllByRole('alert')
      .find(
        (element) => element.textContent === smartMeterIdFilterValidationError
      );
    expect(validationError).toBeInTheDocument();
  });

  it('disables Apply button', async () => {
    const { smartMeterIdFilter, applyButton } = setup();

    await fireEvent.update(smartMeterIdFilter, '');

    expect(applyButton).toBeDisabled();
  });
});

describe('if Smart Meter Id filter is updated with a value', () => {
  const smartMeterIdFilterValue = 'abcd-1234';

  it('does not render validation error', async () => {
    const { smartMeterIdFilter } = setup();

    await fireEvent.update(smartMeterIdFilter, '');
    await fireEvent.update(smartMeterIdFilter, smartMeterIdFilterValue);

    const validationError = screen.queryByText(
      smartMeterIdFilterValidationError
    );
    expect(validationError).not.toBeInTheDocument();
  });

  it('enables Apply button', async () => {
    const { smartMeterIdFilter, applyButton } = setup();

    await fireEvent.update(smartMeterIdFilter, '');
    await fireEvent.update(smartMeterIdFilter, smartMeterIdFilterValue);

    expect(applyButton).toBeEnabled();
  });
});
