var config = require('../config/config.js');
var scrapp_lib = require('./scrap_lib.js');
var articles_db = require('../database/articles.js');
var devise_db = require('../database/devise.js');
var exec  = require('child-process-promise').exec ;
var phantomjs = require('phantomjs-prebuilt')

var binPath = phantomjs.path
var DEBUG = true;
//https://www.xbox.com/Shell/ChangeLocalex

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
  };

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function wait(milleseconds) {
    return new Promise(resolve => setTimeout(resolve, milleseconds))
}
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function cleanTmpSubDirectory( subDirectoryName) {
    let directory = './scripts/tmp/'+subDirectoryName;
    return scrapp_lib.buildDirectory(directory);
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getHTMLByName( lang, name) {
    var promise = exec(binPath + ' ./scripts/' + name + '_scrapper.js ' + lang);
    return promise;
} 
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function procedeFillDBByType( writeHTML, enumType) {
    return new Promise((resolve, reject) => {
        var langs = config.getLangsByType(enumType);

        (DEBUG && !binPath) && console.log("ERROR : Phantomjs undefined !");    
        if ( writeHTML && binPath) {
            writeALLHTMLByType(langs, enumType)
            .then(()=>{
                fillDataBaseByType( langs, enumType).then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            })
            .catch((error)=> {
                console.log(error);
            });
        } else {
            fillDataBaseByType( langs, enumType).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        }
    });

}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

async function writeALLHTMLByType(countrys, enumType) {
    cleanTmpSubDirectory(enumType);
    
    var promises = [];

    for (let i =0; i < countrys.length; i ++) {
        await wait(config.TIMEOUT_SCRAPP);
        promises.push(getHTMLByName(countrys[i], enumType));

    }
    return Promise.all(promises);
 }
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function fillDataBaseByType( countrys, enumType) {
    let promises = [];
    DEBUG && console.log("Download html: " + enumType);
    let db = articles_db.getDBbyType(enumType);
    let scrap_fct = scrapp_lib.getScrapMethod(enumType);

    db.createDBifNotExist();    
    for ( let i = 0; i < countrys.length; i++) {

        promises.push(scrap_fct( countrys[i]));
    }
    return Promise.all(promises);
}




/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */


function procedeFillArticles() {
    return new Promise((resolve, reject) => {
        let promises = [];
        console.log("Begin articles");
        articles_db.createDBifNotExist();
        articles_db.cleanDB();
        devise_db.updateDataBase();
        promises.push( articles_db.writeArticles( articles_db.ENUM.DEALS));
        promises.push( articles_db.writeArticles( articles_db.ENUM.XBOX));
        promises.push( articles_db.writeArticles( articles_db.ENUM.ACCESSORIES));
        promises.push( articles_db.writeArticles( articles_db.ENUM.SURFACE));
    
        
        Promise.all(promises).then(() => {
            articles_db.writeSearchArray().then(() => {
                resolve();
            });
        });
    });
    
}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function procedeToAllScrapFill(overWriteHTML) {
    var promises = [];
    console.log("Begin all scrapp.");
    return new Promise((resolve, reject) => {
        promises.push( procedeFillDBByType(overWriteHTML, articles_db.ENUM.XBOX));
        promises.push( procedeFillDBByType( overWriteHTML, articles_db.ENUM.ACCESSORIES));
        promises.push( procedeFillDBByType( overWriteHTML, articles_db.ENUM.DEALS));
        promises.push( procedeFillDBByType( overWriteHTML, articles_db.ENUM.SURFACE));

        Promise.all(promises).then(()=> {
            procedeFillArticles().then(() => {
                resolve();
            }).catch((err)=> {  
                reject(err);
            })
        }).catch((err) => {
            reject(err);
        });
    })
}


  module.exports = {

    procedeFillArticles,
    procedeToAllScrapFill


  };