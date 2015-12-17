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
        let url = $(el).attr('href');
        links.push({
          title: $(el).text(),
          url: url[url.length - 1] === '/' ? url.slice(0, -1) : url,
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
        url = url[0];
        links.push({
          title: $(el).text(),
          url: url[url.length - 1] === '/' ? url.slice(0, -1) : url,
          rank: (n - i) / n
        });
      });
      resolve(links);
    });
  });

  Promise.all([google, bing]).then((links) => {
    let googleUrls = links[0].map(link => link.url.replace(/https/g, 'http'));
    let results = links[0];

    // combine the two searches, averaging ranks of matching urls
    links[1].forEach(link => {
      let matchIndex = googleUrls.indexOf(link.url.replace(/https/g, 'http'));
      if (matchIndex === -1) {
        results.push(link);
      } else {
        results[matchIndex].rank += link.rank;
        results[matchIndex].rank /= 2;
      }
    });

    res.send(results);
  });

});

module.exports = router;
