export const currencyFormat = (value) =>
  new Intl.NumberFormat('en-EN', {
    style: 'currency',
    currency: 'USD'
  }).format(value);

  export const numberFormat = (value) =>
  new Intl.NumberFormat('en-EN').format(value);