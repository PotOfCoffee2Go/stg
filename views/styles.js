const styles = {
  settings: `
  <style>
    p,
    textarea,
    input[type="text"],
    img,
    hr,
    /* input[type="file"], */
    #decrypt-source, #encrypt-source {
     width: 100%;
    }
    footer {
      width: 100%;
      margin-top: 10px;
    }

    .left-side {
      /* float: left; */
    }
    .right-side {
      float: right;
      width: 48%;
    }

    .box {
      background: #09365d;
      width: 100%;
      padding: 0 10px 4px 10px;
      border: 1px solid #444;
      border-radius: 16px;
    }

    hr {
      margin: 0px;
    }

    textarea {
      display: block;
    }

    label {
      padding-right: 6px;
      border-right: 1px solid black;
    }
    .material-icons-outlined {
      font-size: .9em;
      color: blue;
    }
    #decrypt-source, #encrypt-source {
      display: inline-block;
    }
  </style>
  `,

  stegano: `
  <style>
    iframe {
      background: aliceblue;
      width: 100%;
      resize: both;
      overflow: auto;
    }

   #message-container {
      width: 90%;
      margin-top: 1em;
      padding: 0 4px 0 4px;
    }

    #stegano-container a {
      font-family: monospace;
    }
    #stegano-container p,
    #stegano-container textarea,
    #stegano-container input[type="text"] {
      width: 100%;
    }
    #stegano-container img {
      width: 35%;
      border: 1px solid #888;
      border-radius: 15px;
    }

    #stegano-container {
      width: 100%;
      margin-right: 5%;
    }
  </style>
  `,


  imagesdir: `
  <style>
    .filter {
      margin-bottom: 16px;
    }

    #image-array figure {
      display: inline-block;
      height: 110px;
      margin-right: 6px;
      text-align: center;
    }

    #image-array figcaption {
      font-family: monospace;
    }

    #image-array img {
      display: block;
      height: 100px;
      margin: 0 auto 6px auto;
      border: 1px solid white;
      border-radius: 15px;
      padding: 6px;
      cursor: pointer;
    }

    #carousel { display:none;
      margin: 16px 64px 16px 64px;
      padding: 16px 0 16px 0;
      border-top: 1px solid white;
      border-bottom: 1px solid white;
    }

    #carousel img {
      height: 100px;
      margin-right: 6px;
      border: 1px solid white;
      border-radius: 15px;
      padding: 6px;
      cursor: pointer;
    }

    #carousel .img-container { margin: auto; }

    #carousel div:focus { outline: none; }

    textarea,
    input[name="passphrase"] {
       width: 100%;
    }

    table {
      font-family: monospace;
    }
    th {
      min-width: 110px;
    }
    td {
      padding-right: 10px;
    }
    td button {
      margin-right: 2px;
    }
    #filter {
     width: 100px;
    }
  </style>
  `,
}

exports.styles = styles;
