import { fireEvent, getByRole, render, screen } from '@testing-library/vue';
import App from '../App.vue';
import store from '@/store';
import { setupI18n } from '@/i18n';
import router from '@/router';

const setup = async () => {
  render(App, {
    global: {
      plugins: [store, setupI18n(), router]
    }
  });

  await router.isReady();
};

it('can navigate to Meter Data', async () => {
  await setup();
  const meterDataLink = getByRole(screen.getByRole('navigation'), 'link', {
    name: 'Meter Data'
  });

  fireEvent.click(meterDataLink);

  expect(
    await screen.findByRole('textbox', {
      name: 'Smart Meter Id:'
    })
  ).toBeInTheDocument();
});

it('can navigate to Settings', async () => {
  await setup();
  const settingsLink = getByRole(screen.getByRole('navigation'), 'link', {
    name: 'Settings'
  });

  fireEvent.click(settingsLink);

  expect(await screen.findByLabelText('Language:')).toBeInTheDocument();
});

it('can navigate back to Home after navigating to Settings', async () => {
  await setup();
  const settingsLink = getByRole(screen.getByRole('navigation'), 'link', {
    name: 'Settings'
  });
  fireEvent.click(settingsLink);
  await screen.findByLabelText('Language:');
  const homeLink = getByRole(screen.getByRole('navigation'), 'link', {
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
