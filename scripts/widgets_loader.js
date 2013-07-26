(function() {
  var pathPrefix = location.pathname.indexOf('OurJS') === 1 ? '/OurJS' : '';
  document.writeln('<link rel="stylesheet" href="' + pathPrefix + '/stylesheets/common.css">');
  document.writeln('<link rel="stylesheet" href="' + pathPrefix + '/stylesheets/widgets.css">');
  document.writeln('<link rel="stylesheet" href="' + pathPrefix + '/stylesheets/prettify.css">');
  document.writeln('<script src="' + pathPrefix + '/scripts/common.js"></script>');
  document.writeln('<script src="' + pathPrefix + '/scripts/widgets.js"></script>');
  document.writeln('<script src="' + pathPrefix + '/scripts/prettify.js"></script>');
  document.writeln('<script src="' + pathPrefix + '/widgets/tabpanel.js"></script>');
  document.writeln('<script src="' + pathPrefix + '/scripts/widget-demoarea.js"></script>');
})();
