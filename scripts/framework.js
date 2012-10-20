(function() {
  var pathPrefix = location.pathname.indexOf('OurJS') === 1 ? '/OurJS' : '';
  document.writeln('<link rel="stylesheet" href="' + pathPrefix + '/stylesheets/common.css">');
  document.writeln('<script src="' + pathPrefix + '/scripts/common.js"></script>');
})();
