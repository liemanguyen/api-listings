// Modules for the Google Sheets API.
const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_PATH = 'token.json'

// Modules for the CoinMarketCap API.
const rp = require('request-promise')
const requestOptions = {
  method: 'GET',
  uri: 'https://sandbox-api.coinmarketcap.com/v1/exchange/listings/latest',
  qs: {
    limit: 2,
    sort_dir: 'desc'
  },
  headers: {
    'X-CMC_PRO_API_KEY': '039efbcd-1d21-4b8b-be43-4c136e32810d'
  },
  json: true,
  gzip: true
}

var sheets = google.sheets('v4')
var date = new Date()
var dateString = date.toString()
const spreadsheetId = generateString(10)

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), createSpreadsheet)
  authorize(JSON.parse(content), updateSpreadsheet)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

/**
 * Creates a blank spreadsheet with the specified title.
 * @param {google.auth.OAuth2} authClient The authenticated Google OAuth client.
 */
function createSpreadsheet (authClient) {
  var request = {
    resource: {
      properties: {
        title: 'Top 100 Exchanges by Volume - ' + dateString
      }
    },
    fields: spreadsheetId,
    auth: authClient
  }

  sheets.spreadsheets.create(request, function (err, response) {
    if (err) {
      console.error(err)
      return
    }

    console.log(response.data)
  })
}

/**
 * Updates values in the specified spreadsheet.
 * @param {google.auth.OAuth2} authClient The authenticated Google OAuth client.
 */
function updateSpreadsheet (authClient) {
  var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: spreadsheetId,
    resource: {
      // How the input data should be interpreted.
      valueInputOption: 'INPUT_VALUE_OPTION_UNSPECIFIED',

      // The new values to apply to the spreadsheet.
      data: [{
        range: '',
        majorDimension: '',
        values: []
      }]

      // TODO: Add desired properties to the request body.
    },
    auth: authClient
  }

  sheets.spreadsheets.values.batchUpdate(request, function (err, response) {
    if (err) {
      console.error(err)
      return
    }

    console.log(response.data)
  })
}

/**
 * Generates a string of random letters and numbers of the specified length.
 * @param {number} strLength The length of the string to be generated.
 */
function generateString (strLength) {
  var retString = ''
  var charSet = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  Array.from({ length: strLength }).forEach((x, i) => {
    retString += charSet[Math.floor(Math.random() * Math.floor(charSet.length))]
  })
  return retString
}

/**
rp(requestOptions).then(response => {
  console.log('CoinMarketCap API call response:', response)
}).catch((err) => {
  console.log('CoinMarketCap API call error:', err.message)
}) */
