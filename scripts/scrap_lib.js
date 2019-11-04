const fs = require('fs-extra')
const path = require('path');
var cheerio = require('cheerio');
var currencyFormatter = require('currency-formatter');
var accessories_db = require('../database/accessories.js');
var xbox_db = require('../database/xbox.js');
var surface_db = require('../database/surface.js');
var articles_db = require('../database/articles.js');
var devise_db = require('../database/devise.js');
var deals_db = require('../database/deals.js');
var DEBUG = true;

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function checkHTMLisPresent( country) {
    let path = "./scripts/tmp/accessories/all_" + country + ".html";
    if (fs.pathExistsSync(path)) {
        return true;
    } else {
        return false;
    }
}



/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function buildDirectory(directory) {
    // var save_dir = directory +"_save";
    try {
        if ( fs.pathExistsSync(directory) ) {
            // fs.emptyDirSync(save_dir);
            // fs.removeSync(save_dir);             // On re-creer le dossier.
            // fs.moveSync(directory, save_dir, true); // On creer la nouvelle sauvegarde.
            fs.emptyDirSync(directory);             // On re-creer le dossier.
        } else {
            fs.emptyDirSync(directory);             // On creer le dossier.
            // fs.emptyDirSync(save_dir);             // On creer le dossier.

        }
    } catch(e) { throw(e); }
}
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getContentHTMLAccessory(lang) {
    let path = "./scripts/tmp/accessories/all_" + lang + ".html";
    return fs.readFile(path, "utf-8");    
}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getContentHTMLXbox(lang) {
    let path = "./scripts/tmp/xbox/xbox_" + lang + ".html";
    return fs.readFile(path, "utf-8");    
}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getContentHTMLSurface(lang) {
    let path = "./scripts/tmp/surface/surface_" + lang + ".html";
    return fs.readFile(path, "utf-8");    
}
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getContentHTMLDeals(lang) {
    let path = "./scripts/tmp/deals/deals_" + lang + ".html";
    return fs.readFile(path, "utf-8");    
}
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getContentHTML(lang, enumType) {
    let path = "./scripts/tmp/" + enumType+ "/" + enumType + "_" + lang + ".html";
    return fs.readFile(path, "utf-8");    
}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
function removeLastChar(str) {
    return str.substring(0, str.length - 1);
}
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */



/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
                                // ACCESSORIES
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function scrappFileAccessoryByLang( lang) {
    return new Promise((resolve, reject)=> {

        getContentHTMLAccessory( lang)
        .then((result) => {
            let $ = cheerio.load(result);
            let newObject;
            let tmp_uri_img;
            let tmp_name_lang;
            let section_items = $("div.m-channel-placement-item");//-> modif
            let tmp_devise;
            let tmp_price;
            let tmp_url;
            let tmp_description;
    
            section_items.each((index, item) => {
    
                id_microsoft = JSON.parse( $(item).find("a").attr("data-m")).pid;
                newObject = accessories_db.getEmptyInstance();
    
                // <section> role="presentation"
                // prix -> <div> class=c-price, inner de la balise <s>
                // img srcset -> <picture> attribut data-scrset
                // nom_lang -> dans la balise section attribut data-pid
                // id_microsoft -> dans la balise section attribut data-pid
                if ( id_microsoft ) {
                    // ID Microsoft + region
                    newObject.id_microsoft = id_microsoft;
                    newObject.lang = lang;
    
                    // URL
                    tmp_url = $(item).find("a").attr("href");
                    newObject.url = tmp_url ? tmp_url : "";
    
                    // Description
                    tmp_description = $(item).find("p.c-paragraph-4").text();//-> modfi
                    newObject.description = tmp_description ? tmp_description : "";
    
                    // IMG uri
                    tmp_uri_img =  $(item).find("source").attr("data-srcset");
                    newObject.url_img = tmp_uri_img ? tmp_uri_img : "";
        
                    // Nom regionale
                    tmp_name_lang =JSON.parse( $(item).find("a").attr("data-m")).cN;//-> moddif
                    newObject.name = tmp_name_lang ? tmp_name_lang : "" ;
    
                    // Devise & prix
                    tmp_devise = $(item).find("span[itemprop=priceCurrency]").attr("content");
                    tmp_devise = tmp_devise ? tmp_devise.replace("/",""):"";
                    newObject.devise.name = tmp_devise ? tmp_devise.replace("/","") : "" ;
                    
                    tmp_price = $(item).find("span[itemprop=price]").text();
    
                    if ( tmp_price && tmp_price[0] === ("€")) {
                        tmp_price = tmp_price.substr(1) +" "+ tmp_price.substr(0, 1);
                        tmp_price = tmp_price.replace(".", ",");
                    }
    
                    newObject.price = tmp_price && tmp_devise ? currencyFormatter.unformat(tmp_price, { code: tmp_devise }) : "";
                    newObject.devise.symbole = tmp_devise ? currencyFormatter.findCurrency(tmp_devise).symbol : "";
        
                   
    
                    newObject.usd_price = tmp_devise ? devise_db.getUSDValue( newObject.price, newObject.devise.name) : "";
        
                    accessories_db.addOneAccessory(newObject);
                }        
                      
            });
    
            resolve();
        })
        .catch((err)=> reject(err));   
    }) ;
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
                                // XBOX
  /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */


function scrappFileXboxByLang( lang) {

    return new Promise((resolve, reject) => {
        let objectToAdd;
        DEBUG && console.log("scrap XBOX: "+lang);

        getContentHTMLXbox( lang)
        .then((result) => {
            let $ = cheerio.load(result);
            let newObject;
            let tmp_uri_img;
            let tmp_name_lang;
            let section_items = $("div.m-channel-placement-item");//-> modif
            let tmp_devise;
            let tmp_price;
            let tmp_description;
            let tmp_url;
            

            section_items.each((index, item) => {

                id_microsoft = JSON.parse( $(item).find("a").attr("data-m")).pid;
                newObject = xbox_db.getEmptyInstance();

                // <section> role="presentation"
                // prix -> <div> class=c-price, inner de la balise <s>
                // img srcset -> <picture> attribut data-scrset
                // nom_lang -> dans la balise section attribut data-pid
                // id_microsoft -> dans la balise section attribut data-pid
                if ( id_microsoft ) {
                    // ID Microsoft + region
                    newObject.id_microsoft = id_microsoft;
                    newObject.lang = lang;

                    // URL
                    tmp_url = $(item).find("a").attr("href");
                    newObject.url = tmp_url ? tmp_url : "";

                    // Description
                    tmp_description = $(item).find("p.c-paragraph-4").text();//-> modfi
                    newObject.description = tmp_description ? tmp_description : "";

                    // IMG uri
                    tmp_uri_img =  $(item).find("source").attr("data-srcset");
                    newObject.url_img = tmp_uri_img ? tmp_uri_img : "";
        
                    // Nom regionale
                    tmp_name_lang =JSON.parse( $(item).find("a").attr("data-m")).cN;//-> moddif
                    newObject.name = tmp_name_lang ? tmp_name_lang : "" ;

                    // Devise & prix
                    tmp_devise = $(item).find("span[itemprop=priceCurrency]").attr("content");
                    tmp_devise = tmp_devise ? tmp_devise.replace("/",""):"";
                    newObject.devise.name = tmp_devise ? tmp_devise.replace("/","") : "" ;
                    
                    tmp_price = $(item).find("span[itemprop=price]").text();

                    if ( tmp_price && tmp_price[0] === ("€")) {
                        tmp_price = tmp_price.substr(1) +" "+ tmp_price.substr(0, 1);
                        tmp_price = tmp_price.replace(".", ",");
                    }

                    newObject.price = tmp_price && tmp_devise ? currencyFormatter.unformat(tmp_price, { code: tmp_devise }) : "";
                    newObject.devise.symbole = tmp_devise ? currencyFormatter.findCurrency(tmp_devise).symbol : "";    
    
                    newObject.usd_price = tmp_devise ? devise_db.getUSDValue( newObject.price, newObject.devise.name) : "";
                    
                    xbox_db.addOne(newObject);
                } else {
                    DEBUG && console.log("ERROR: Cannot find object ID !");
                }
                    
            });

            resolve();
        }).catch((err)=>{console.log(err);reject(err)}); 
    });
}


/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
  /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
  /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

/*  *   *   *   *   *   * SURFACE   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */



function scrappFileSurfaceByLang( lang) {
    return new Promise((resolve, reject) => {
        let objectToAdd;
        getContentHTMLSurface( lang)
        .then((result) => {
            let $ = cheerio.load(result);
            let newObject;
            let tmp_uri_img;
            let tmp_name_lang;
            let section_items = $("div.m-channel-placement-item");//-> modif
            let tmp_devise;
            let tmp_price;
            let tmp_description;
            let tmp_url;
            

            section_items.each((index, item) => {

                id_microsoft = JSON.parse( $(item).find("a").attr("data-m")).pid;
                newObject = surface_db.getEmptyInstance();

                // <section> role="presentation"
                // prix -> <div> class=c-price, inner de la balise <s>
                // img srcset -> <picture> attribut data-scrset
                // nom_lang -> dans la balise section attribut data-pid
                // id_microsoft -> dans la balise section attribut data-pid
                if ( id_microsoft ) {
                    // ID Microsoft + region
                    newObject.id_microsoft = id_microsoft;
                    newObject.lang = lang;

                    // URL
                    tmp_url = $(item).find("a").attr("href");
                    newObject.url = tmp_url ? tmp_url : "";

                    // Description
                    tmp_description = $(item).find("p.c-paragraph-4").text();//-> modfi
                    newObject.description = tmp_description ? tmp_description : "";

                    // IMG uri
                    tmp_uri_img =  $(item).find("source").attr("data-srcset");
                    newObject.url_img = tmp_uri_img ? tmp_uri_img : "";
        
                    // Nom regionale
                    tmp_name_lang =JSON.parse( $(item).find("a").attr("data-m")).cN;//-> moddif
                    newObject.name = tmp_name_lang ? tmp_name_lang : "" ;

                    // Devise & prix
                    tmp_devise = $(item).find("span[itemprop=priceCurrency]").attr("content");
                    tmp_devise = tmp_devise ? tmp_devise.replace("/",""):"";
                    newObject.devise.name = tmp_devise ? tmp_devise.replace("/","") : "" ;
                    
                    tmp_price = $(item).find("span[itemprop=price]").text();

                    if ( tmp_price && tmp_price[0] === ("€")) {
                        tmp_price = tmp_price.substr(1) +" "+ tmp_price.substr(0, 1);
                        tmp_price = tmp_price.replace(",", " ");
                        tmp_price = tmp_price.replace(".", ",");
                    }

                    newObject.price = tmp_price && tmp_devise ? currencyFormatter.unformat(tmp_price, { code: tmp_devise }) : "";
                    newObject.devise.symbole = tmp_devise ? currencyFormatter.findCurrency(tmp_devise).symbol : "";    
    
                    newObject.usd_price = tmp_devise ? devise_db.getUSDValue( newObject.price, newObject.devise.name) : "";
        
                    surface_db.addOne(newObject);
                }        
                    
            });

            resolve();
        }).catch((err)=>reject(err)); 
    });
}

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
  /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
  /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

/*  *   *   *   *   *   * DEALS   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */



function scrappFileDealsByLang( lang) {
    return new Promise((resolve, reject) => {

        getContentHTMLDeals( lang)
        .then((result) => {
            let $ = cheerio.load(result);
            let newObject;
            let tmp_uri_img;
            let tmp_name_lang;
            let section_items =$("div.m-channel-placement-item");//-> modif
            let tmp_devise;
            let tmp_price;
            let tmp_description;
            let tmp_url;
            

            section_items.each((index, item) => {

                id_microsoft = JSON.parse( $(item).find("a").attr("data-m")).pid;
                newObject = surface_db.getEmptyInstance();

                // <section> role="presentation"
                // prix -> <div> class=c-price, inner de la balise <s>
                // img srcset -> <picture> attribut data-scrset
                // nom_lang -> dans la balise section attribut data-pid
                // id_microsoft -> dans la balise section attribut data-pid
                if ( id_microsoft ) {
                    // ID Microsoft + region
                    newObject.id_microsoft = id_microsoft;
                    newObject.lang = lang;

                    // URL
                    tmp_url = $(item).find("a").attr("href");
                    newObject.url = tmp_url ? tmp_url : "";

                    // Description
                    tmp_description = $(item).find("p.c-paragraph-4").text();//-> modfi
                    newObject.description = tmp_description ? tmp_description : "";

                    // IMG uri
                    tmp_uri_img =  $(item).find("source").attr("data-srcset");
                    newObject.url_img = tmp_uri_img ? tmp_uri_img : "";
        
                    // Nom regionale
                    tmp_name_lang =JSON.parse( $(item).find("a").attr("data-m")).cN;//-> moddif
                    newObject.name = tmp_name_lang ? tmp_name_lang : "" ;

                    // Devise & prix
                    tmp_devise = $(item).find("span[itemprop=priceCurrency]").attr("content");
                    tmp_devise = tmp_devise ? tmp_devise.replace("/",""):"";
                    newObject.devise.name = tmp_devise ? tmp_devise.replace("/","") : "" ;
                    
                    tmp_price = $(item).find("span[itemprop=price]").text();

                    if ( tmp_price && tmp_price[0] === ("€")) {
                        tmp_price = tmp_price.substr(1) +" "+ tmp_price.substr(0, 1);
                        tmp_price = tmp_price.replace(".", ",");
                    }

                    newObject.price = tmp_price && tmp_devise ? currencyFormatter.unformat(tmp_price, { code: tmp_devise }) : "";
                    newObject.devise.symbole = tmp_devise ? currencyFormatter.findCurrency(tmp_devise).symbol : "";    
    
                    newObject.usd_price = tmp_devise ? devise_db.getUSDValue( newObject.price, newObject.devise.name) : "";
        
                    deals_db.addOne(newObject);
                }        
                    
            });

            resolve();
        }).catch((err)=>reject(err)); 
    });
}

function getScrapMethod( enumType) {
    switch (enumType) {
        case articles_db.ENUM.ACCESSORIES :
            return scrappFileAccessoryByLang;

        case articles_db.ENUM.XBOX :
            return scrappFileXboxByLang;

        case articles_db.ENUM.SURFACE :
            return scrappFileSurfaceByLang;

        case articles_db.ENUM.DEALS :
            return scrappFileDealsByLang;
    }
}

module.exports = {
    
    checkHTMLisPresent,
    buildDirectory,
    getContentHTMLAccessory,
    removeLastChar,
    getContentHTMLXbox,
    getContentHTMLSurface,
    getScrapMethod

  };

