// import { writeFile } from 'fs';
const fs = require('fs');
// import * as fs from 'fs';

require('dotenv').config();

const environment = process.env.ENVIRONMENT;

let apiUrl;

if (environment === 'production') {
    apiUrl = process.env.PRODUCTION_API_ENDPOINT;
} else if (environment === 'staging') {
    apiUrl = process.env.STAGING_API_ENDPOINT;
}

let tokenKey;
tokenKey = process.env.TOKEN_KEY;
const targetPath = `./src/environments/environment.prod.ts`;
const envConfigFile = `
  export const environment = { 
      production: true,
      hmr: false,
      apiUrl: '${apiUrl}',
      tokenKey: '${tokenKey}'};`;
fs.writeFile(targetPath, envConfigFile, function (err) {
    if (err) {
        console.log('>>>>>>>>>> config write error:', err);
    }
});