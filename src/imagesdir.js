const fs = require('fs');
const fsp = fs.promises;
const _projectdir = require('path').resolve(__dirname, '..');

// Render Mustache templates
const { render, renderError } = require('./render');

// Load page template(s) on startup
const pages = {
  imagesdir: fs.readFileSync(_projectdir + '/views/imagesdir.html', { encoding: 'utf8' }),
};

// Get the images directory file statistics and render to page
const viewImagesDir = async (cfg, req, res) => {
  try {
    let dirlist = [];
    let files = await fsp.readdir(cfg.homeDir + '/public/images');
    for (let file of files) {
      let stats = await fsp.stat(cfg.homeDir + '/public/images/' + file);
      dirlist.push({
        name: file,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
      });
    }
    let dirlistJsonStr = JSON.stringify(dirlist);
    render(cfg, res, pages.imagesdir, { dirlistJsonStr });
  } catch (error) {
    return renderError(cfg, res, error);
  }
};

exports.viewImagesDir = viewImagesDir;
