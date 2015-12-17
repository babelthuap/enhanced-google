'use strict';

// inject jQuery
var script = document.createElement('script');
script.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(script);

// scrape Google search results
var links = [];
$('#ires h3 a').each((i, el) => {
  var dataHref = $(el).data('href');
  links.push({
    title: $(el).text(),
    url: dataHref ? dataHref : $(el).attr('href')
  });
});
console.log(links);


// example search url:
// https://www.google.com/search?q=clogs#q=clogs&start=0
//                                 ^^^^^   ^^^^^       ^
