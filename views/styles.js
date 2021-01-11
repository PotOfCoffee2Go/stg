const styles = {
  index: `
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

    .left-side {
      float: left;
    }
    .right-side {
      float: right;
      width: 48%;
    }

    .box {
      background: #09365d;
      width: 50%;
      padding: 0 10px 0 10px;
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

    #stegano-container p,
    #stegano-container textarea,
    #stegano-container input[type="text"],
    #stegano-container img {
       width: 100%;
    }
    #stegano-container img {
      border: 1px solid #888;
      border-radius: 15px;
    }

    #stegano-container {
      width: 35%;
      margin-right: 5%;
    }
  </style>
  `,


  imagesdir: `
  <style>
    /* unvisited, visited, mouse over, selected link */
    a:link { color: aliceblue; text-decoration: none; }
    a:visited { color: aliceblue; text-decoration: none; }
    a:hover { color: aliceblue; text-decoration: none; }
    a:active { color: aliceblue; text-decoration: none; }

    #carousel img {
      height: 100px;
      margin: auto;
      border: 1px solid white;
      border-radius: 15px;
    }

    input[name="passphrase"] {
       width: 35%;
    }
    table {
      font-family: monospace;
    }
    th {
      min-width: 150px;
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
