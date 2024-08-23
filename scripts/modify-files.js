/**
 * This is a template script file for bulk manipulation of files.
 * To run: `node scripts/modify-files.js` from the root directory.
 * You can update this file with your own logic.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const providerGuidesDir = path.join(__dirname, '../src/provider-guides');

// Skip these files, overview is not for a provider, Jira and Confluence just link to the Atlassian guide.
const filesToSkip = ['overview.mdx', 'jira.mdx', 'confluence.mdx'];

let catalog = {};

const sharedSection = `## What's Supported

### Supported Actions

This connector supports:
- [Proxy Actions](/define-integrations/proxy-actions), using the base URL `;

function main() {
  loadCatalogJSON().then(loaded => {
    catalog = loaded["catalog"];
    // Read all files in a directory
    fs.readdir(providerGuidesDir, (err, files) => {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }

      // To test, uncomment this to just run the logic on one file,
      // and comment out the forEach loop below
      // runOnEachFile(files[1])

      files.forEach(file => {
        runOnEachFile(file);
      });
    });
  })
}

// TODO: replace this function with the actual logic you want to run on each file.
function runOnEachFile(file) {
  if (filesToSkip.includes(file)) return;

  const filePath = path.join(providerGuidesDir, file);
  let baseURL = "";

  try {
    // remove the `.mdx` from the file name
    const provider = file.slice(0, -4);
    baseURL = catalog[provider]["baseURL"];
  } catch {
    console.error("Cannot fetch base URL for " + file);
    return
  }

  const newSection = `${sharedSection}\`${baseURL}\`.\n\n`;

  // Read each file content
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(`Could not read the file: ${file}`, err);
      return;
    }
    // Find where `## Before You Get Started` occurs
    const index = content.indexOf("## Before You Get Started");

    if (index === -1) {
      console.error(`Cannot find where to insert new content for ${filePath}`)
    }

    // Insert the new section right above it
    const newContent = content.slice(0, index) + newSection + content.slice(index);

    writeFile(filePath, newContent).then(() => {
      // console.log(`Processed ${file}`);
    });
  });
}

// This is an async function that writes content to a file.
function writeFile(filePath, content) {
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

main();
