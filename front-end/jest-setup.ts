import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// 1. environment variables
process.env.VUE_APP_BACK_END_API_BASE_URL = 'http://localhost:8080/api/v1';
process.env.VUE_APP_DEFAULT_SMART_METER_ID =
  '7eb6cb7a-bd74-4fb3-9503-0867b737c2f6';
process.env.VUE_APP_I18N_DEFAULT_LOCALE = 'en-gb';

// 2. vue-chart-3 and chart.js
declare global {
  interface Window {
    ResizeObserver: unknown;
  }
}

const doNothing = () => {
  // do nothing
};

class ResizeObserver {
  observe() {
    doNothing();
  }

  unobserve() {
    doNothing();
  }

  disconnect() {
    doNothing();
  }
}

window.ResizeObserver = ResizeObserver;
