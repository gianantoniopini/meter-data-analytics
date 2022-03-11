import { fireEvent, render, screen } from '@testing-library/vue';
import DatePicker from 'vue3-date-time-picker';
import App from '../App.vue';
import store from '@/store';
import { setupI18n } from '@/i18n';
import router from '@/router';

const setup = async () => {
  render(App, {
    global: {
      plugins: [store, setupI18n(), router],
      components: { DatePicker }
    }
  });

  await router.isReady();
};

it('can navigate to Meter Data', async () => {
  await setup();
  const meterDataLink = screen.getByRole('link', {
    name: 'Meter Data'
  });

  fireEvent.click(meterDataLink);

  expect(
    await screen.findByRole('heading', {
      name: 'Meter Data'
    })
  ).toBeInTheDocument();
});

it('can navigate to Settings', async () => {
  await setup();
  const settingsLink = screen.getByRole('link', {
    name: 'Settings'
  });

  fireEvent.click(settingsLink);

  expect(
    await screen.findByRole('heading', {
      name: 'Settings'
    })
  ).toBeInTheDocument();
});

it('can navigate back to Home after navigating to Settings', async () => {
  await setup();
  const settingsLink = screen.getByRole('link', {
    name: 'Settings'
  });
  fireEvent.click(settingsLink);
  await screen.findByRole('heading', {
    name: 'Settings'
  });
  const homeLink = screen.getByRole('link', {
    name: 'Home'
  });

  fireEvent.click(homeLink);

  expect(
    await screen.findByRole('heading', {
      name: 'Welcome to the Meter Data Analytics app.'
    })
  ).toBeInTheDocument();
});

afterEach(async () => {
  await router.push({ name: 'home' });
});
