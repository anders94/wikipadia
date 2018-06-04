
var $ = require('jquery');
var handleMainPage = require('./handleMainPage');

function handleData (data, lang) {
  var contentEl = document.getElementById('content');

  if (data.error) {
    contentEl.innerHTML = data.error.info;
    return false
  }

  window.data = data.parse;

  var html = data.parse.text['*'];
  var title = data.parse.title;
  var regex = new RegExp('href="/wiki/', 'g');

  html = html.replace(regex, 'href="?');

  // Fix for special links

  ['File', 'Help', 'Book'].forEach(function(typeString, i) {
    html = html.split('?' + typeString).join(`https://${lang}.m.wikipedia.org/wiki/${typeString}`);
  });

  var pageTitle = title.replace(/ /g, '_').toLowerCase();

  contentEl.innerHTML = pageTitle === 'main_page' ? html.replace(/style="[^"]*"/g, "") : html;

  var remoteLinks = document.querySelectorAll('a[href*="wikipedia.org"]');
  Array.prototype.forEach.call(remoteLinks, function(el, i){
    el.target = '_blank';
  });


  $('html').addClass( pageTitle );

  if (pageTitle === 'main_page') handleMainPage();

  if ( !$('#toc').length ) {
    $('#toc-toggle').addClass('hidden');
  } else {
    $('#toc-toggle').removeClass('hidden');
  }

  // if ($('.image').eq(0).find('img').length) {
  //   var imgSrc = $('.image').eq(0).find('img').attr('src').replace('thumb/', ''),
  //       arr = imgSrc.split('/')
  //
  //   arr.splice(arr.length - 1);
  //
  //   var $header = $('<div id="header-image" class="header-image" style="background-image: url(' + arr.join("/") + ')"></div>');
  //
  //   $('.container').before($header);
  // }

  var titleEl = document.createElement('h1');
  titleEl.classList.add('page-title')
  titleEl.innerHTML = title;

  contentEl.parentElement.insertBefore(titleEl, contentEl.parentElement.firstChild);

  document.title = title + " – WikiPadia";

  if ($('#coordinates').length) {
    $.getScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js').done(function() {
      $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.css">')
      var geo = $('#coordinates').find('.geo');

      if (geo.length) {
        var latlng = L.latLng( geo.text().split(';'))

        $('body > .container').before('<div id="map" />');

        var map = L.map('map', {
          zoomControl: false,
          scrollWheelZoom: false,
          zoom: 12,
          center: latlng,
          attributionControl: false
        });

        var tileLayer = new L.TileLayer('//{s}.tile.stamen.com/{style}/{z}/{x}/{y}.png', { style: 'toner-lines' });
        tileLayer.addTo(map);
      }
    });
  }

  if ($('ul.redirectText').length) {
    $('ul.redirectText').find('li a').each(function (i, el) {
      var $link = $(el);
      var newHref = $link.attr('href').replace('/w/index.php?title=', '?').replace('&redirect=no', '');

      $link.attr('href', newHref);
    });
  }
}

module.exports = handleData;
