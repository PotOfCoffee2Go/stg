This project is the initial creation of a Steganography application server. Once the code has been fleshed out, this repo will be archived as to show the commits from inception to initial release.

Steganoserver is a node.js application designed to run locally on the user's computer using a web browser as the graphical user interface. The application embeds OpenPGP encrypted text into images which can be securely published either through private or public means. To decrypt the message the receipiant must know the passphrase to extract the text from the image as well as
have a private key to decode the message itself.

In order to communicate the sender and recepient(s) would need to clone and install this application to perform the underlying details of the information transfer. Thus, [git][] and [node.js][] are required for on a machine to run this application. Both are readilly available for most systems via download and install.

The server requires a 32 character 'master' passphrase passed as a parameter when the server is launched. This passphrase is generated upon initial startup of the server. Once set it can not be changed, and if lost, the server will no longer be able to decrypt any messages created or recieved by the server. The passphrase gives the server access to the private OpenPGP key.

Speaking of keys, the server will automatically generate a public/private key-pair to identify the server to recepients. It is easier to think of the keys as identifing this instance of the 'server' - not as 'you'. It is possible to use existing OpenPGP keys which you might have for other communications - but would be in your best interest to let the server generate it's own keys to be used specifically for embedding your messages into images.

In lue of using a 'key-server', the distribution of public keys between your and your friends server's is via a broadcast  system. In the documentation you will see the concept of 'lockboxes' which wraps the implementation of the distribution of public keys in a hopefully simple to understand way.

Speaking of simplicity. the user is not involved in the usage of keys, signing, encrypting or decrypting messages. All of these activities are performed under-the-hood.

The server can be backed up or moved to another machine using the 'git bundle create' command as described in the [documentation][].


The browser's basic job is presentation, while most of the 'work' is done by the server. The server by design is to be run locally, and not exposed to the internet. For proper operation the server uses private keys, although these keys are squirreled away in private directories, for maximum securty one should NOT run the server exposed to the internet.
