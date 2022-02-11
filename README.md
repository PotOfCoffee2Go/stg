# Imbosk Encoded Steganography Server

This steganography web server not only hides messages in images, it also encrypts the messages embedded in the images. The heavy lifting is done by [@mykeels/steganography][1] which is inspired by [rodrigouroz/steganography][2].

> This is a Draft project to produce the baseline code needed to produce the production server! Use for experimentation.

Messages can be rendered as plain text, Markdown, or an HTML document. The passphrases used to encrypt/decrypt messages are used on-the-fly and **NOT STORED ANYWHERE** - server or client side. (So... if you forget the passphrase, your pretty much out of luck on decrypting the message!)

> That being said, as a convenience the server has a `default passphase` configuration parameter in the config.js file which you can use or not. Note that...
<hr>
>> “Just because you're paranoid doesn't mean they aren't after you.”
>>> ― Joseph Heller, Catch-22
<hr>

Images are stored by the server to present a directory list of images. Most server pages have an 'Images' button which displays all images that have been encrypted, decrypted, or viewed.

## Recommendations
The pages of the server have been designed with simplicity in mind. Well... as much as HTML, stylesheets, views, and javascript code can be _simple_. The config.js settings allow the colors, logo, header, and such to be set to your personal preferences. Knowledge of [Express][] and [Mustache][] would be helpful - but no rocket science going on here, so even beginners should be able to make a distinctive site.

It is recommended to `git clone` from [GitHub][] and run in your browser as `http://localhost:8000`. Basically, using the browser as an 'app' that encrypts and displays embedded messages locally. To extract/decrypt your messages, recipient(s) also need to clone the server onto their computer(s) as well!

Programmers wishing to create a custom server for themselves and recipients can either publish the site onto the web, or (IMHO) fork the repo, make/push mods, and have recipients install from your fork. Don't forget to change this README.md 'installation' instructions to point to your fork!

## Installation
> The steanography server requires [git][3] and [nodejs][4] to be pre-installed on your computer.

Clone the server repository and install it:

```cmd
git clone https://github.com/PotOfCoffee2Go/stegano-server.git
cd stegano-server
npm install
```

There are various ways to fire up the server. We'll use :

```cmd
npm start
```


> A common tweak is to change the port which the server 'listens'. The quick and dirty way is to pass the 'port' as a parameter when starting the server:

>> `npm start -- -p 3030`

> would listen for browser address

>> `http://localhost:3030`.

Barring [Murphy's Law][] the steganography home page should show up in your browser at address `http://localhost:8000`. To see the document your viewing right now press the 'Docs' button or go to `http://localhost:8000/docs`.




For a secret message to be sent and decoded by recipients ...

  1. You and they install and run the server
  2. `Save as...` an image and encrypt a message into it.
  3. Post that image on a public social media site
    - Facebook, Messager, Medium, Instagram, Blog, blah...blah, etc
  4. Pre-arranged messaging with recipient(s)
    - Your recipients needs to know what in-plain-site images have secret messages
    - any pic of my pet
    - any pic of my breakfast
    - any pic of my private bits
  5. Recipients need to know the passphrase
    - Give to them on a napkin
    - Give as text in already known encrypted image
    - only send by email? an encrypted image with passphrase


### Kudos
To [Express][], [Mustache][], [highlightjs][], and [markdown-it][] which are used to run the site.

[yargs][] processes server command line arguments.

The `/public/assets/md/themes` directory is a copy of [jasonm23's markdown-css-themes](http://jasonm23.github.io/markdown-css-themes/) repo.

Documentation generated from markdown by [mixu/markdown-styles][7].

Images provided by [Pixabay][8].


[1]: https://github.com/mykeels/steganography
[2]: https://github.com/rodrigouroz/steganography
[3]: https://git-scm.com/
[4]: https://nodejs.org/
[5]: https:/github.com/repo/issues
[6]: https://ngrok.com/
[7]: https://github.com/mixu/markdown-styles
[8]: https://pixabay.com/

