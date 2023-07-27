import 'vitest-canvas-mock'

// vue-chartjs and chart.js
const doNothing = () => {}

class ResizeObserver {
  observe() {
    doNothing()
  }

  unobserve() {
    doNothing()
  }

  disconnect() {
    doNothing()
  }
}
window.ResizeObserver = ResizeObserver

class MutationObserver {
  observe() {
    doNothing()
  }

  unobserve() {
    doNothing()
  }

  disconnect() {
    doNothing()
  }

  takeRecords() {
    return []
  }
}
window.MutationObserver = MutationObserver
