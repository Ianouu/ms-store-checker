var articles_db = require('../database/articles.js');

const TIMEOUT_SCRAPP = 5000;



/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAllLangs() {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('./config/langs.json', 'utf8'));
    return json.langs;
};
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAllLangsArray() {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('./config/langs.json', 'utf8'));
    var array = [];

    for ( var i = 0; i < json.langs.length; i++) {
        array.push( json.langs[i].lang);
    }
    return array;
};

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAllXboxLangsArray() {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('./config/langs.json', 'utf8'));
    var array = [];

    for ( var i = 0; i < json.langs_xbox.length; i++) {
        array.push( json.langs_xbox[i].lang);
    }
    return array;
};

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAllAccessoriesLangsArray() {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('./config/langs.json', 'utf8'));
    var array = [];

    for ( var i = 0; i < json.langs_surface.length; i++) {
        array.push( json.langs_surface[i].lang);
    }
    return array;
};


function getLAngsByType (enumType) {
    switch (enumType) {
        case articles_db.ENUM.ACCESSORIES :
            return getAllAccessoriesLangsArray();

        case articles_db.ENUM.XBOX :
            return getAllXboxLangsArray();

        case articles_db.ENUM.SURFACE :
            return getAllSurfaceLangsArray();
    }
};
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getLangsByType( enumType) {
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync('./config/langs.json', 'utf8'));
    var array = [];

    for ( var i = 0; i < json[enumType].length; i++) {
        array.push( json[enumType][i].lang);
    }
    
    return array;
};

module.exports = {
    
    getAllLangs,
    getAllLangsArray,
    getAllXboxLangsArray,
    getAllAccessoriesLangsArray,
    getLangsByType,
    TIMEOUT_SCRAPP 

  };