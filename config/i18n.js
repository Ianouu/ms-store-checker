var i18n = require('i18n');

i18n.configure({
  // setup some locales - other locales default to en silently
  locales:['en-GB', 'fr-FR', 'it-IT', 'de-DE', 'es-ES', 'pl-PL'],

  // where to store json files - defaults to './locales' relative to modules directory
  directory: __dirname + '/locales',
  
  defaultLocale: 'en-GB',
  
  // sets a custom cookie name to parse locale settings from  - defaults to NULL
  cookie: 'lang',

  preserveLegacyCase: false
});

module.exports = function(req, res, next) {

  i18n.init(req, res);
//   res.local('__', res.__);

  var current_locale = i18n.getLocale();

  return next();
};