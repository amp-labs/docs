/**
 * This is a template script file for bulk manipulation of files.
 * To run: `node scripts/script.ts` from the root directory.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const providerGuidesReadmeDir = path.join(__dirname, '../provider-guides-readme');
const providerGuidesMdxDir = path.join(__dirname, '../src/provider-guides');
const imagesDirectory = path.join(__dirname, '../src/images/provider-guides');


// Read all files in the directory
fs.readdir(providerGuidesMdxDir, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  // downloadImage(files[1]);
  files.forEach(file => {
    downloadImage(file);
  });
});

function downloadImage(file) {
  const oldLink = '[Ampersand Console](https://console.withampersand.com)';
  const newLink = '[Ampersand Dashboard](https://dashboard.withampersand.com)';
  const filePath = path.join(providerGuidesMdxDir, file);

  // Read each file content
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(`Could not read the file: ${file}`, err);
      return;
    }

    // Regular expression to find image URLs
    const regex = /https:\/\/files\.readme\.io\/[^"')]+/g;
    let images = content.match(regex);

    if (!images) {
      images = [];
    }

    // Download each image found
    let imageDownloadPromises = Promise.all(images.map(url => {
      const imgFileName = url.split('/').pop();
      const imagePath = path.join(imagesDirectory, imgFileName);

      return axios({
        method: 'get',
        url,
        responseType: 'stream'
      }).then(response => {
        
        return new Promise((resolve, reject) => {
          response.data.pipe(fs.createWriteStream(imagePath))
            .on('finish', () => {

              let fullImagePath = path.join('/images/provider-guides', imgFileName);
              console.log(`Downloaded ${fullImagePath} from ${url}`);

              // Replace the URL in the content with the new image path
              content = content.replace(url, fullImagePath);
              resolve(true);
            })
            .on('error', e => {
              console.error(`Error downloading ${imgFileName}:`, e);
              reject(e);
            });
        });
      }).catch(error => console.error(`Error downloading from URL ${url}:`, error));
    }));
    
    return imageDownloadPromises.then(() => {

      const dashboardLinkUpdated =  content.replace(oldLink, newLink);
      // All the images have been downloaded, now update the content of the file with the new image paths
      return writeFile(filePath, dashboardLinkUpdated);
    }).then(() => console.log(`Successfully processed ${filePath}`)
  ).catch(error => console.error(`Error downloading images:`, error));
  });
}

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
