(function() {
  var commonCss = '/stylesheets/common.css';
  var commonJs = '/scripts/common.js';
  if (location.pathname.indexOf('OurJS') === 1) {
    commonCss = '/OurJS' + commonCss;
    commonJs = '/OurJS' + commonJs;
  }
  document.writeln('<link rel="stylesheet" href="' + commonCss + '">');
  document.writeln('<script src="' + commonJs + '"></script>');
})();
