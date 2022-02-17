import { queryAllByRole, render, screen } from '@testing-library/vue';
import App from '../App.vue';
import { setupI18n } from '@/i18n';
import router from '@/router';

const setup = async () => {
  render(App, {
    global: {
      plugins: [setupI18n(), router]
    }
  });

  await router.isReady();
};

it('renders Navbar menu', async () => {
  await setup();

  const navigation = screen.queryByRole('navigation');
  expect(navigation).toBeInTheDocument();
  const navigationLinks = queryAllByRole(navigation as HTMLElement, 'link');
  expect(navigationLinks).toHaveLength(4);
  expect(navigationLinks[0]).toHaveTextContent('Meter Data Analytics');
  expect(navigationLinks[1]).toHaveTextContent('Home');
  expect(navigationLinks[2]).toHaveTextContent('Meter Data');
  expect(navigationLinks[3]).toHaveTextContent('Settings');
});

it('renders welcome message', async () => {
  await setup();

  expect(
    screen.queryByRole('heading', {
      name: 'Welcome to the Meter Data Analytics app.'
    })
  ).toBeInTheDocument();
});
