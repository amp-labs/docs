/**
 * This script will generate provider guides, based on catalog info.
 * To run: `node scripts/gen-guides.js` from the root directory.
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const Handlebars = require("handlebars");

const providerGuidesDir = path.join(__dirname, '../src/provider-guides');

let catalog = {};
let apiKeyTemplate = null;
let basicAuthTemplate = null;
let clientCredentialsTemplate = null;

const createdGuides = [];
const authorizationCodeGuidesNotFound = []; 

async function main() {
  await loadTemplates()
  const loaded = await loadCatalogJSON()
  
  catalog = loaded["catalog"];

  const promises = [];
  
  for (const [provider, info] of Object.entries(catalog)) {
      promises.push(runForEachProvider(provider, info));
  }

  await Promise.all(promises).then(() => {
    // TODO: for some reason, these console logs are not showing up, but the guides are getting created properly... 
    console.log('-------------- Newly Created Guides ---------');
    console.log(createdGuides);
    console.log('-------------- Authorization Code Guides Not Found ---------');
    console.log(authorizationCodeGuidesNotFound);
  }).catch(console.error).finally(() => console.log('done'))

}

async function runForEachProvider(provider, info) {
  if (info["support"]["proxy"] === false) return;

  switch (info["authType"]){
    case "basic":
      return createBasicGuide(provider, info);
    case "apiKey":
      return createApiKeyGuide(provider, info);
    case "oauth2":
      return handleOAuthType(provider, info);
    default:
      return;
  }
}

async function handleOAuthType(provider, info) {
  switch (info["oauth2Opts"]["grantType"]){
    case "clientCredentials":
      return createClientCredentialsGuide(provider, info);
    case "authorizationCode":
      return checkGuideExists(provider);
    default:
      return
  }
}

async function createBasicGuide(provider, info) {
  addToCreatedGuides(provider);
  const vars = parseInfo(provider, info);
  const DISPLAY_NAME = vars.DISPLAY_NAME;
  const DOCS_URL = info["basicOpts"] ? info["basicOpts"]["docsURL"] : null;

  const docsSection = `
## Credential format for ${DISPLAY_NAME}

${DISPLAY_NAME} uses a non-standard format for Basic Auth, which means that the username and password fields do not correspond to the actual username and password that a customer uses to log in. [Click here](${DOCS_URL}) for more information about the expected credential format for ${DISPLAY_NAME}. The UI components will display this link, so that your users can successfully provide their credentials.
`
  const template = Handlebars.compile(basicAuthTemplate)
  const substituted = template(vars);

  if (DOCS_URL) {
    return writeProviderGuide(provider, substituted + docsSection);
  }
  return writeProviderGuide(provider, substituted);  
}

async function createApiKeyGuide(provider, info){
  addToCreatedGuides(provider);
  const vars = parseInfo(provider, info);
  const DISPLAY_NAME = vars.DISPLAY_NAME;
  const DOCS_URL = info["apiKeyOpts"]["docsURL"];

  const docsSection = `
## Creating an API key for ${DISPLAY_NAME}

[Click here](${DOCS_URL}) for more information about generating an API key for ${DISPLAY_NAME}. The UI components will display this link, so that your users can successfully create API keys.
`
  const template = Handlebars.compile(apiKeyTemplate)
  const substituted = template(vars);

  if (DOCS_URL) {
    return writeProviderGuide(provider, substituted + docsSection);
  }
  return writeProviderGuide(provider, substituted);
  
}

async function createClientCredentialsGuide(provider, info){
  addToCreatedGuides(provider);
  const vars = parseInfo(provider, info);
  const DISPLAY_NAME = vars.DISPLAY_NAME;
  const DOCS_URL = info["oauth2Opts"]["docsURL"];

  const docsSection = `
## Creating Client ID and Client Secret for ${DISPLAY_NAME}

[Click here](${DOCS_URL}) for more information about how to create a Client ID and Client Secret for ${DISPLAY_NAME}. The UI components will display this link, so that your users can successfully generate these credentials.
`
  const template = Handlebars.compile(clientCredentialsTemplate)
  const substituted = template(vars);

  if (DOCS_URL) {
    return writeProviderGuide(provider, substituted + docsSection);
  }
  return writeProviderGuide(provider, substituted);  

}

function addToCreatedGuides(provider) {
  const newGuide = `provider-guides/${provider}`;
  console.log(`'${newGuide}',`)
  createdGuides.push(newGuide);
}

function parseInfo(provider, info) {
  const displayName = info["displayName"] || provider.charAt(0).toUpperCase() + provider.slice(1);

  return {
    NAME: provider,
    DISPLAY_NAME: displayName,
    BASE_URL: info["baseURL"]
  }
}

async function checkGuideExists(provider) {
  const filePath = path.join(providerGuidesDir, `${provider}.mdx`);

  return fs.readFile(filePath).then(() => null).catch(err => {
    authorizationCodeGuidesNotFound.push(provider)
  })
}

async function writeProviderGuide(provider, content) {
  const filePath = path.join(providerGuidesDir, `${provider}.mdx`);
  return writeFile(filePath, content);
}

// This is an async function that writes content to a file.
async function writeFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error(`Could not write the file: ${filePath}`, err);
        reject(err);
      }
      resolve(true);
    });
  });
}

async function loadCatalogJSON() {
  const url = 'https://github.com/amp-labs/connectors/raw/main/internal/generated/catalog.json';
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to load JSON:', error.message);
      console.error('Response data:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

async function loadTemplates() {

  const loadApiKeyTemplate = fs.readFile(path.join(__dirname, "templates/api-key-provider-guide.mdx"), { encoding: 'utf8' }).then(content => {
    apiKeyTemplate = content;
  });

  const loadBasicAuthTemplate = fs.readFile(path.join(__dirname, "templates/basic-auth-provider-guide.mdx"), { encoding: 'utf8' }).then(content => {
    basicAuthTemplate = content;
  });

  const loadClientCredentialsTemplate = fs.readFile(path.join(__dirname, "templates/client-credentials-provider-guide.mdx"), { encoding: 'utf8' }).then(content => {
    clientCredentialsTemplate = content;
  });

  return Promise.all([
    loadApiKeyTemplate,
    loadBasicAuthTemplate,
    loadClientCredentialsTemplate
  ]).catch(console.error);
}

main().then(() => console.log("done")).catch(console.error);
