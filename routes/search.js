'use strict';

const express = require('express')
    , cheerio = require('cheerio')
    , request = require('request');

let router = express.Router();

function googleUrl(query, start) {
  if (!start) start = 0;
  return `https://www.google.com/search?q=${query}#q=${query}&start=${start}`;
}

router.get('/:query', function(req, res) {
  request.get(googleUrl(req.params.query), (err, googleRes, html) => {
    let $ = cheerio.load(html);
    let $results = $('#ires h3 a');

    let links = [];
    $results.each((i, el) => {
      let dataHref = $(el).data('href');
      let url = dataHref ? dataHref : $(el).attr('href');
      url = url.match(/http.+?(?=&|$)/);
      if (!url) return;
      links.push({
        title: $(el).text(),
        url: url[0]
      });
    });

    res.send(links);
  });
});

module.exports = router;
