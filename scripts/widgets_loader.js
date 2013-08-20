(function() {
  var pathPrefix = location.pathname.indexOf('OurJS') === 1 ? '/OurJS' : '';
  document.writeln('<link rel="stylesheet" href="' + pathPrefix + '/stylesheets/common.css">');
  document.writeln('<link rel="stylesheet" href="../../stylesheets/widgets.css">');
  document.writeln('<link rel="stylesheet" href="../../stylesheets/prettify.css">');
  document.writeln('<script src="' + pathPrefix + '/scripts/common.js"></script>');
  document.writeln('<script src="../../scripts/widgets.js"></script>');
  document.writeln('<script src="../../scripts/prettify.js"></script>');
  document.writeln('<script src="../../widgets/tabpanel.js"></script>');
  document.writeln('<script src="../../scripts/widget-demoarea.js"></script>');
})();
