'use strict';

const express = require('express')
    , cheerio = require('cheerio')
    , request = require('request');

let router = express.Router();

function googleUrl(query, start) {
  if (!start) start = 0;
  return `https://www.google.com/search?q=${query}#q=${query}&start=${start}`;
}

function bingUrl(query) {
  return `https://www.bing.com/search?q=${query}`;
}

router.get('/:query', function(req, res) {

  let bing = new Promise((resolve, reject) => {
    request.get(bingUrl(req.params.query), (err, bingRes, html) => {
      let $ = cheerio.load(html);
      let $results = $('.b_algo').find('h2').find('a');
      let links = [];
      let n = $results.length - 1;
      $results.each((i, el) => {
        links.push({
          title: $(el).text(),
          url: $(el).attr('href'),
          rank: (n - i) / n
        });
      });
      resolve(links);
    });
  });

  let google = new Promise((resolve, reject) => {
    request.get(googleUrl(req.params.query), (err, googleRes, html) => {
      let $ = cheerio.load(html);
      let $results = $('#ires h3 a');
      let links = [];
      let n = $results.length - 1;
      $results.each((i, el) => {
        let dataHref = $(el).data('href');
        let url = dataHref ? dataHref : $(el).attr('href');
        url = url.match(/http.+?(?=&|$)/);
        if (!url) return;
        links.push({
          title: $(el).text(),
          url: url[0],
          rank: (n - i) / n
        });
      });
      resolve(links);
    });
  });

  Promise.all([bing, google]).then((links) => {
    links[0].concat(links[1]);

    


    res.send(links[0].concat(links[1]));
  });

});

module.exports = router;
































