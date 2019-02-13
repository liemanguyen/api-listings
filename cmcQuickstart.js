/* Example in Node.js ES6 using request-promise, concepts should translate to your language of choice */

// Fetch all active cryptocurrencies by market cap and return market values in USD.
const rp = require('request-promise')
const requestOptions = {
  method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
  qs: {
    start: 1,
    limit: 5000,
    convert: 'USD'
  },
  headers: {
    'X-CMC_PRO_API_KEY': 'bf0fcc9b-0830-4f38-ad01-889c895ec119'
  },
  json: true,
  gzip: true
}

rp(requestOptions).then(response => {
  console.log('API call response:', response)
}).catch((err) => {
  console.log('API call error:', err.message)
})
