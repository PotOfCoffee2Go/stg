// Server configuration options allow the site to be personalized
//
const config = {

// ------ Server Options
  // Port the server listens for requests
  listenPort: 8000,

  // Server home directory
  homeDir: process.cwd(),

// ------ En/Decode Options (can be modified via 'settings' page)
  // Default passphrase shown on web pages
  passphrase: 'YOUR_PASSPHRASE_HERE', // 'YouR PassphasE H3R3',

// ------ Page Layout
  // HTML of logo in-front of heading
  logo: `<img src="/assets/logo.png"
    style="float: left; width: 48px; transform: scaleX(-1); margin-right: 6px;">`,

  // Heading on top of page
  heading: '<h3>PotOfCoffee2Go Encoded Steganography</h3>',

  // Footer on bottom of page
  footer: `<div><hr>Images by <a href="https://pixabay.com" target="_blank">Pixabay</a><hr></div>`,

  // Display help/hints in web pages (can be modified via 'settings' page)
  inlineHelp: true,

// ------ Image Options (can be modified via 'settings' page)

  // Subdirectory path in 'public' to hold the encrypted images
  // Do not include '/public/' - just the subdirectory path
  // ex: 'images', 'images/mine', 'pictures'
  imagesDir: 'images/mine',

  // Help identify encrypted images by prefixing the image's filename
  // The filename is prefixed when an image is encrypted.
  // To prevent prefixing make imagePrefix an empty string ''.
  // Is useful to identify person that encrypted the image
  //  and/or hint of the passphrase used
  imagePrefix: 'poc2go',

  // Allow overwriting of existing embedded images
  // The message in an image can be overwritten with a different message
  imageOverwrite: true,

  // Carousel image onclick displays 'View' page or 'Decrypt' page
  //  Note: the 'V' or 'D' are uppercase
  carouselClick: 'Decrypt',

  // Allow fetching of images by URL
  // Display text field to paste web link to the image
  //  Note: Not uncommon to get a 'CORS' permission error depending
  //     on how the sending web site's permissions are configured
  askurl: false,

// ------ Message formatting options (can be modified via 'settings' page)

  // Default text type 'plain', 'markdown,  'html'
  textType: 'markdown',
  // Markdown styles - see
  markdowncss: 'agate.min.css',
  // Code highlightjs styles - see https://highlightjs.org/static/demo/
  highlightcss: 'agate.min.css',
}

// ------ HTML to include in web pages

// HTML inserted in pages <head> tag
// At least, place your preferred font family here
//  and in cfg.theme below
config.head = `
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Bad+Script&display=swap" rel="stylesheet">
`,

// Common styles for the pages
config.theme = `
<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Bad Script'; //, cursive;
    background: #16095d;
    color: aliceblue;
  }

  p { background: #2f328c; }


  input[type="button"], button {
    border-radius: 10px;
  }

  a:link { color: aliceblue; font-weight: bold; } /* unvisited link */
  a:visited { color: aliceblue; } /* visited link */
  a:hover { color: hotpink; } /* mouse over link */
  a:active { color: blue; }   /* selected link */

</style>
`;

// Page specific styles are in './views/styles.js'
const { styles } = require('./views/styles');
config.styles = styles;


// ------ Code used by server. Rarely changed!

// Sites allowed access to steganography server
//  Note: any site can GET files from 'public' and it's subdirectories
const allowedOrigins = ['http://localhost', 'http://127.0.0.1'];

// Function that determines if a site has permissions to en/decrypt
//  - callback(null, true) = yes, callback(error) = no
config.corsOptions = {
  origin: (origin, callback) => {
    // Allow routes not monitored by CORS
    if (!origin) return callback(null, true);

    let originAllowed = false;
    allowedOrigins.forEach(allowed => {
      if (origin.indexOf(allowed) !== -1) originAllowed = true;
    });
    if (!originAllowed) {
      return callback(new Error(`CORS 'Access-Control-Allow-Origin' does not allow '${origin}'`));
    }
    return callback(null, true);
  }
}

// Server command line interface
// Allows temporary override of configuration parameters defined above
config.cli = () => {
  var argv = require('yargs')
    .option('port', {
      alias: 'p',
      describe: 'Server listen on port'
    })
    .option('askurl', {
      alias: 'a',
      describe: 'Allow images to be fetched from internet by URL'
    })
    .option('dir', {
      alias: 'd',
      describe: 'Directory of images'
    })
    .usage('Usage: $0 [-p | --port <port>] [-a | --askurl] [-d | --dir=<path>] [-h]')
    .example('$0 -p 3000', 'Starts server on port 3000')
    .help('h')
    .alias('h', 'help')
    .argv;

  if (argv.p) {
    config.listenPort = argv.p;
  }
  if (argv.a) {
    config.askurl = true;
  }
  if (argv.d) {
    config.testdir = argv.d;
    console.log('test dir>>>>', argv.d);
  }
}

// Apply command line options
config.cli();

exports.config = config;
