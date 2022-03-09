import { DefineNumberFormat } from 'vue-i18n';

const numberFormat: DefineNumberFormat = {
  decimal: {
    style: 'decimal',
    minimumFractionDigits: 3,
    maximumFractionDigits: 5
  },
  percent: {
    style: 'percent',
    useGrouping: false
  }
};

export default numberFormat;
