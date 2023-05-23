import type { DefineNumberFormat } from 'vue-i18n'

const numberFormat: DefineNumberFormat = {
  decimal: {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  },
  percent: {
    style: 'percent',
    useGrouping: false
  }
}

export default numberFormat
