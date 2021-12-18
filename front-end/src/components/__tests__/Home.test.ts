import { render, screen } from '@testing-library/vue';
import Home from '../Home.vue';

it('It renders correctly', () => {
  render(Home);

  expect(screen.queryByText('Home')).toBeInTheDocument();
});
