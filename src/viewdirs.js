const fs = require('fs');
const fsp = fs.promises;
const _projectdir = require('path').resolve(__dirname, '..');

// Render Mustache templates
const { render, renderError } = require('./render');

// Load page template(s) on startup
const pages = {
  keysdir: fs.readFileSync(_projectdir + '/views/keysdir.html', { encoding: 'utf8' }),
  boxesdir: fs.readFileSync(_projectdir + '/views/boxesdir.html', { encoding: 'utf8' }),
  imagesdir: fs.readFileSync(_projectdir + '/views/imagesdir.html', { encoding: 'utf8' }),
};

// Get the keys directory file statistics and render to page
const viewBoxesDir = async (cfg, req, res) => {
  try {
    let dirlist = [];
    let files = await fsp.readdir(cfg.homeDir + '/public/' + cfg.lockboxesDir);
    for (let file of files) {
      let stats = await fsp.stat(cfg.homeDir + '/public/' + cfg.lockboxesDir + '/' + file);
      dirlist.push({
        name: file,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
      });
    }
    let dirlistJsonStr = JSON.stringify(dirlist);
    render(cfg, res, pages.boxesdir, { dirlistJsonStr });
  } catch (error) {
    return renderError(cfg, res, error);
  }
};

// Get the keys directory file statistics and render to page
const viewKeysDir = async (cfg, req, res) => {
  try {
    let dirlist = [];
    let files = await fsp.readdir(cfg.homeDir + '/public/' + cfg.keysDir);
    for (let file of files) {
      let stats = await fsp.stat(cfg.homeDir + '/public/' + cfg.keysDir + '/' + file);
      dirlist.push({
        name: file,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
      });
    }
    let dirlistJsonStr = JSON.stringify(dirlist);
    render(cfg, res, pages.keysdir, { dirlistJsonStr });
  } catch (error) {
    return renderError(cfg, res, error);
  }
};

// Get the images directory file statistics and render to page
const viewImagesDir = async (cfg, req, res) => {
  try {
    let dirlist = [];
    let files = await fsp.readdir(cfg.homeDir + '/public/' + cfg.imagesDir);
    for (let file of files) {
      let stats = await fsp.stat(cfg.homeDir + '/public/' + cfg.imagesDir + '/' + file);
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

exports.viewKeysDir = viewKeysDir;
exports.viewBoxesDir = viewBoxesDir;
exports.viewImagesDir = viewImagesDir;
