const cfg = {
  listenPort: 8000,

  // Server home directory
  homeDir: process.cwd(),

  // Logo in-front of heading
  logo: '<img src="/assets/logo.png" style="float: left; width: 64px; transform: scaleX(-1);">',

  // Heading on top of page
  heading: '<h3>PotOfCoffee2Go Encrypted Steganography</h3>',

  // Default passphrase
  //  Of course cannot update passphrase on existing images
  //  since text/image passphases are not known or stored anywhere!
  passphrase: 'YOUR_PASSPHRASE_HERE', // 'YouR PassphasE H3R3',

  // Markdown styles - see
  markdowncss: 'agate.min.css',
  // Code highlightjs styles - see https://highlightjs.org/static/demo/
  highlightcss: 'agate.min.css',

  // Allow fetching of images by URL
  allowurl: false,

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


// Command line interface overrides defaults above
// See https://stackabuse.com/how-to-create-a-node-js-cli-application/
cfg.cli = () => {
  var argv = require('yargs')
    .option('port', {
      alias: 'p',
      describe: 'Server listen on port'
    })
    .option('dir', {
      alias: 'd',
      describe: 'Directory of images'
    })
    .usage('Usage: $0 [-p=port] [-d=directory] [-h]')
    .example('$0 -p 3000', 'Starts server on port 3000')
    .help('h')
    .alias('h', 'help')
    .argv;

  if (argv.p) {
    cfg.listenPort = argv.p;
  }
  if (argv.d) {
    cfg.testdir = argv.d;
    console.log('test dir>>>>', argv.d);
  }
}

// Assign command line options
cfg.cli();


exports.cfg = cfg;
