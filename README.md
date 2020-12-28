# PotOfCoffee2Go Encrypted Steganography Server

This steganography web server not only hides messages in images, it also encrypts the messages embedded in the images. The underlying grunt work is done by [@mykeels/steganography][1] which is inspired by [rodrigouroz/steganography][2].

[Express][], [Mustache][], [highlightjs][], and [markdown-it][] are used to run the site which encrypts and render the text embedded in images.

Messages can be plain text, Markdown, or an HTML document. The passphrases used to encrypt/decrypt messages are used on-the-fly and **NOT STORED ANYWHERE** - server or client side. (If you forget the passphrase, your pretty much out of luck on decrypting the message!)

Images are stored by the server to present a directory list of recently created and viewed images.

Although the server can be run exposed to the web, it is ultimately more secure to run as `localhost` (private). The advantage to a public server is the images with encrypted text are available online and users do not need to install the server to create and view messages.

## Install
The most secure way to run the server is private and choose a local image to encrypt - then post or email to receipiants. However, that requires that both the sender and receipiant(s) install the server on their local computer's. This is the recommended method to run the server.

[nodejs][4] is required to be installed on the computer to run the server.

To install and run the server ...
```
npm i https://github.../TBD
cd TBD && npm install
npm start
```

If all goes well, in your browser go to `http://localhost:8000` and you are ready to encrypt your first message into an image. (if doesn't go well, grrr... submit an issue on [github][5]. Your feedback is appreciated.) Port 8000 can be changed in the project directory `config.js` - but more on that later...

## Usage
The home page allows messages to be extacted and decrypted from images; as well as messages to be encrypted and embedded into images. An image can be chosen from your computer or fetched from the web. (It is common to get an 'Unable to fetch' error for images on the web due to [CORS][] security. Instead  right-click the image in the browser or app displaying the image and 'save as...' - then can chose the image for encryption/decryption from the steganography server home page.)

Choose an image from your computer, let's say a pic of what you had for lunch (a Facebook standard) and encrypt a message into it. The image with the text encrypted is displayed and you can right-click 'Save as...' to store the image with encrypted message on your machine - can now, for example, post that image to your Faceook wall. Unbeknownst to most your Facebook 'friends' - the in-plain-site,  probably ignored 'pic of what I had for lunch' contains a secret message. Pre-arranged, some friends know that any time you post a lunch pic - they Right-click -> 'Save as...' and then decrypt by going to their 'http://localhost:8000`, enter the passphrase and choosing the image.

The server stores every image which has an encrypted or decrypted message.



[1]: https://github.com/mykeels/steganography
[2]: https://github.com/rodrigouroz/steganography
[3]: https://git-scm.com/
[4]: https://nodejs.org/
[5]: https:/github.com/repo/issues
[6]: https://ngrok.com/
