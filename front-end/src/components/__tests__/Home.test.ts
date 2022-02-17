import { render, screen } from '@testing-library/vue';
import Home from '../Home.vue';
import { setupI18n } from '@/i18n';

it('renders welcome message', () => {
  render(Home, {
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
