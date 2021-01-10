// Sites allowed access to steganography server
const allowedOrigins = ['http://localhost', 'http://127.0.0.1'];

const cfg = {
  listenPort: 8000,

  // Server home directory
  homeDir: process.cwd(),

  // Logo in-front of heading
  logo: `<img src="/assets/logo.png"
    style="float: left; width: 48px; transform: scaleX(-1); margin-right: 6px;">`,

  // Heading on top of page
  heading: '<h3>PotOfCoffee2Go Encrypted Steganography</h3>',

  // Default passphrase
  //  Of course cannot update passphrase on existing images
  //  since text/image passphases are not known or stored anywhere!
  passphrase: 'YOUR_PASSPHRASE_HERE', // 'YouR PassphasE H3R3',

  // Help to identify embeded images by prefixing embedded image's filename
  imagePrefix: 'poc2go-',

  // Allow overwriting of existing embedded images
  imageOverwrite: false,

  // Allow fetching of images by URL
  askurl: false,

  // Markdown styles - see
  markdowncss: 'agate.min.css',
  // Code highlightjs styles - see https://highlightjs.org/static/demo/
  highlightcss: 'agate.min.css',

}

cfg.head = `
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Bad+Script&display=swap" rel="stylesheet">
`,

// More robust way to enter styles using CSS
//  Is applied to all pages
cfg.theme = `
<style>
  body {
    background: #16095d;
    color: aliceblue;
    font-family: 'Bad Script', cursive;
  }

  p { background: #2f328c; }
</style>
`

cfg.corsOptions = {
  origin: (origin, callback) => {
    // Allow routes not monitored by CORS
    if (!origin) return callback(null, true);

    let originAllowed = false;
    allowedOrigins.forEach(allowed => {
      if (origin.indexOf(allowed) !== -1) originAllowed = true;
    });
    if (originAllowed) return callback(null, true);
    return callback(new Error(`CORS 'Access-Control-Allow-Origin' does not allow '${origin}'`));
  }
}

// Command line interface
// See https://stackabuse.com/how-to-create-a-node-js-cli-application/
cfg.cli = () => {
  var argv = require('yargs')
    .option('port', {
      alias: 'p',
      describe: 'Server listen on port'
    })
    .option('askurl', {
      alias: 'a',
      describe: 'Ask for images to be fetched from internet'
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
    cfg.listenPort = argv.p;
  }
  if (argv.a) {
    cfg.askurl = true;
  }
  if (argv.d) {
    cfg.testdir = argv.d;
    console.log('test dir>>>>', argv.d);
  }
}

// Assign command line options
cfg.cli();


exports.cfg = cfg;
