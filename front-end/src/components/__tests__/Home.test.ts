import { render } from '@testing-library/vue';
import Home from '../Home.vue';

it('It renders correctly', () => {
  const { getByText } = render(Home);

  getByText('Home');
});
