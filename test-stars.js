const fetch = require('node-fetch');
fetch('https://api.github.com/repos/zoxilsi/zoxilsi.cc')
  .then(r => r.json())
  .then(d => console.log(d.stargazers_count));
