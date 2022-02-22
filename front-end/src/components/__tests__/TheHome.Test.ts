import { render, screen } from '@testing-library/vue';
import TheHome from '../TheHome.vue';
import { setupI18n } from '@/i18n';

it('renders welcome message', () => {
  render(TheHome, {
    global: {
      plugins: [setupI18n()]
    }
  });

  expect(
    screen.queryByRole('heading', {
      name: 'Welcome to the Meter Data Analytics app.'
    })
  ).toBeInTheDocument();
});
