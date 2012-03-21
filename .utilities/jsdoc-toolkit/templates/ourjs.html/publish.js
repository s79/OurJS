/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
  // Config.
  publish.conf = {
    outDir: JSDOC.opt.d || SYS.pwd + '../out/jsdoc/',
    templatesDir: JSDOC.opt.t || SYS.pwd + '../templates/jsdoc/'
  };

  // Templates.
  try {
    var symbolsHeaderTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'symbols_header.tmpl');
    var symbolsTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'symbols.tmpl');
    var symbolsFooterTemplate = new JSDOC.JsPlate(publish.conf.templatesDir + 'symbols_footer.tmpl');
  }
  catch (e) {
    print('Create templates failed: ' + e);
    quit();
  }

  // Get a list of all the classes in the symbolset.
  var classes = symbolSet.toArray().filter(function($) {
    return ($.is('CONSTRUCTOR') || $.isNamespace)
  });

  // Output data.
  var output = symbolsHeaderTemplate.process(null);
  for (var i = 0, l = classes.length; i < l; i++) {
    var symbol = classes[i];
    symbol.methods = symbol.getMethods();
    output += symbolsTemplate.process(symbol);
  }
  output += symbolsFooterTemplate.process(null);
  IO.saveFile(publish.conf.outDir, 'symbols.html', output);

}

/** Build output for displaying function parameters. */
function makeSignature(params) {
  if (!params) {
    return '()';
  }
  return '('
      +
      params.filter(
          function($) {
            return $.name.indexOf('.') == -1; // don't show config params in signature
          }
      ).map(
          function($, index) {
            return $.isOptional ? ('[' + (index ? ', ' : '') + $.name + ']') : ((index ? ', ' : '') + $.name);
          }
      ).join('')
      +
      ')';
}
