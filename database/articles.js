const connection = new(require('nosqlite').Connection)('./database');
const db = connection.database('articles');
var accessories_db = require('../database/accessories.js');
var xbox_db = require('../database/xbox.js');
var config = require('../config/config.js');
var surface_db = require('../database/surface.js');
var devise_db = require('../database/devise.js');
var deals_db =require('../database/deals.js');
const download = require('image-downloader');
const fs = require('fs-extra');

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = require('./mongo_config').MONGO_URL;

var ENUM = {
    "ACCESSORIES" : "accessories",
    "XBOX" : "xbox",
    "SURFACE" : "surface",
    "DEALS" : "deals"
}


/*  Database structure:
/ { 'id' : id,
/   'id_microsoft' : id_microsoft
/   'lang' : lang
/   'name' : name_lang
/   'price' : price
/   'url_img: url de l'image
/ }
*/

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function createDBifNotExist() {
    // if (!db.existsSync() ) {
    //     db.createSync();
    // } else {
        
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            db_mongo.collection('articles', {}, function(err, article) {
                article.remove({}, function(err, result) {
                    if (err) console.log(err);                    
                    db_mongo.close();
                });
            });
        });
        // db.destroySync();
        // db.createSync();
    // }    
    fs.emptyDirSync("./public/db/img");             // On re-creer le dossier des images.

}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 function getEmptyInstance() {

    let instance = new Object();
    instance = {
        'id_microsoft' : "",
        'name' : new Object(),
        'BASE' : "",
        'price' : "",
        'url_img' : "",
        'usd_price' : "",
        'devise' : {
            "name" : "",
            "symbole" : ""
        },
        'description' : new Object(),
        'prices' : new Object()
    };    
    return instance;
}


 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 function addOne( obj) {
    if ( obj.id_microsoft && obj.id_microsoft != '') {
        obj.id = obj.id_microsoft ;
        
        savePictures(obj).then(() => {
            
            MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
                if (err) {
                return console.log(err);
                }
                // Do something with db here, like inserting a record
                db_mongo.collection('articles').insertOne( obj,
                function (err, res) {
                    if (err) {
                        db_mongo.close();
                    return console.log(err);
                    }
                    // Success
                    db_mongo.close();
                }
                )
            });
        })
        .catch(() => {
            obj.img_dest = "public/db/img/none.png";
        });
    } else {
        console.log("ARTICLE not defined");
    }
}



function savePictures( objArticle) {
    return new Promise((resolve, reject) => {
        let dest = './public/db/img/'+objArticle.id +'.png'
        let options;
        let promise;
        objArticle.img_dest = './db/img/'+objArticle.id +'.png'; 
    
        fs.pathExists(dest).then((exist) => {
            if ( !exist) {
                options= {
                    url: objArticle.url_img,
                    dest: dest
                };
                promise = download.image(options).then(() => {
                    objArticle.img_dest = './db/img/'+objArticle.id +'.png';
                    resolve();
                }).catch((err)=> console.log(err));
            } else resolve();
        }).catch((err)=> console.log(err));
    });
    
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAll() {
    return new Promise((resolve, result) => {
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            db_mongo.collection('articles').find({}).toArray(function(err, result) {
                if ( err) reject(err);
                else {
                    resolve(result);
                    db_mongo.close();
                }
            });
        });
    });
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 async function getALLByMicrosoftID(microsoft_id) {
    let all = await getAll();//db.allSync();
    let all_tmp = [];
    let tmp = null;
    
    for (let i=0; i < all.length; i++) {
        tmp = all[i];
        if ( tmp.id_microsoft === microsoft_id) {
            all_tmp.push(tmp);
        }
    }
    return all_tmp;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 async function getAllByBase( enumBase) {
    //  return new Promise((resolve, reject) => {
        let all = await getAll();//db.allSync();
        let all_tmp = [];
        let tmp = null;

        for (let i=0; i < all.length; i++) {
            tmp = all[i];
            if ( tmp.BASE === enumBase) {
                all_tmp.push(tmp);
            }
        }
        // resolve(all_tmp);
    // });    
    return new Promise((resolve) => resolve(all_tmp));
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

async function removeAllByBase( enumBase) {
    let all = await getAllByBase( enumBase);
    for (let i =0; i < all.length; i++) {
        db.deleteSync( all[i].id);  
    }
    // fs.emptyDirSync("../database/img");             // On re-creer le dossier des images.
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

async function cleanDB() {
    let all = await getAll();
    for (let i =0; i < all.length; i++) {
        db.deleteSync( all[i].id);
    }
    // fs.emptyDirSync("../database/img");             // On re-creer le dossier des images.
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 async function getAllByBase( enumBase) {
    // return new Promise((resolve, reject) => {
       let all = await getAll();//db.allSync();
       let all_tmp = [];
       let tmp = null;

       for (let i=0; i < all.length; i++) {
           tmp = all[i];
           if ( tmp.BASE === enumBase) {
               all_tmp.push(tmp);
           }
       }
    //    resolve(all_tmp);
//    });    
    return new Promise((resolve) => resolve(all_tmp));

}


 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
async function getAllIDMicrosoft() {
    let all = await getAll();//db.allSync();
    let all_id_microsoft = [];
    let tmp_id = "";

    for (let i=0; i < all.length; i++) {
        tmp_id = all[i].id_microsoft;
        if ( !all_id_microsoft.includes(tmp_id)) {
            all_id_microsoft.push(tmp_id);
        }
    }
    return all_id_microsoft;
}


function getByMicrosoftID( id) {
    return new Promise((resolve, reject) => {
        var query = { "id_microsoft" : id };
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            db_mongo.collection('articles').find(query).toArray(function(err, result) {
                if ( err) reject(err);
                else {
                    resolve(result[0]);
                    db_mongo.close();
                }
            });
        });
    });
    // return db.getSync(id);      // TODO I: Modifier en mongoDB ! 
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */



async function writeArticles( enumDB) {
    let db_tmp = getDBbyType( enumDB);
    let tmp;
    let all_id_microsoft = await db_tmp.getAllIDMicrosoft();
    let result = [];
    let tmp_result = getEmptyInstance();

    removeAllByBase(enumDB);
    // console.log(all_id_microsoft.length);
    for( let i = 0; i < all_id_microsoft.length; i++) {
        tmp_result = getEmptyInstance();
        tmp = await db_tmp.getCheapestByMicrosoftID( all_id_microsoft[i]);
        await addContentToArticles( db_tmp, tmp_result, all_id_microsoft[i]);

        if ( tmp && tmp.id_microsoft) {

            tmp_result.id_microsoft = tmp.id_microsoft;
            tmp_result.url_img = tmp.url_img;
            tmp_result.usd_price = tmp.usd_price;
            tmp_result.BASE = enumDB;
            // console.log(tmp_result);

            addOne( tmp_result);
            
        }
    }
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
async function addContentToArticles( db_tmp, tmp_result, id_microsoft) {
    let tmp_all_objects = [];
    let description = null;
    let name = null;
    let price = null;
    let lang = null;



    tmp_all_objects = await db_tmp.getALLByMicrosoftID( id_microsoft);
    // console.log(tmp_all_objects);
    for( let i = 0; i < tmp_all_objects.length; i++) {

        lang = tmp_all_objects[i].lang.substring(0,2);
        description = tmp_all_objects[i].description;
        name = tmp_all_objects[i].name;
        price = tmp_all_objects[i].price;

        tmp_result.description[ lang] = description ? description : "";
        tmp_result.name[ lang] = name ? name : "";
        tmp_result.prices[ lang] = price ? price : -1;
    }
}
 

async function writeSearchArray() {
    return new Promise((resolve, reject) => {
        var config = require('../config/config.js');
        let array_search = {};
        array_search.id_microsoft = "array_names";
        array_search.arr = [];

        let name_article;
        let langs;
        // let all = getAll();
        getAll().then((all) => {
            var langs_all = config.getAllLangsArray();
            for ( let i =0 ; i < langs_all.length; i++) {
                lang = langs_all[i].substring(0,2);
                array_search[ lang] = [];
            }

            for( let i =0 ; i < all.length; i++) {
                
                name_article = all[i].name;
                tmp_key = all[i].BASE + "_" + all[i].id_microsoft;
    
                if ( name_article) {
                    
                    langs = Object.getOwnPropertyNames(name_article);
    
                    for (let j=0; j < langs.length; j++ ) {
                        if ( !array_search[ langs[j] ]) {
                            array_search[ langs[j] ] = [];
                        }
    
                        array_search[ langs[j] ].push( 
                            {
                                key : tmp_key,
                                value : name_article[ langs[j]]
                            });
                            
                        // array_search.arr.push( tmp[ langs[j]]);
    
                    }
                }
            }

            // addOne(array_search);
            MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
                if (err) return console.log(err);
                db_mongo.collection('articles').insertOne( array_search,
                function (err, res) {
                    if (err) {
                        db_mongo.close();
                        return console.log(err);
                    }
                    db_mongo.close();
                });
            });
            // db.postSync(array_search);

            resolve();
        });
        
    });    
}

function getDBbyType( enumType) {
    switch (enumType) {
        case ENUM.ACCESSORIES :
            return accessories_db;

        case ENUM.XBOX :
            return xbox_db;

        case ENUM.SURFACE :
            return surface_db;

        case ENUM.DEALS :
            return deals_db;
    }
}

function isArticleMatching( article, lang, text) {
    if ( article.id_microsoft != "array_names" ) {
        text = decodeURIComponent(text);
        // let title = article.name[lang.substring(0,2)] ? article.name[lang.substring(0,2)] : article.name[Object.keys(article.name)[0]];
        if ( text && text != "null" && text != "" ) {
            let key_words = text.split(" ");
            let description = article.description[lang.substring(0,2)] ? article.description[lang.substring(0,2)] : article.description[Object.keys(article.description)[0]];
            let match = 0;
            for ( let i =0; i < key_words.length; i++) {
                if (description.toLowerCase().includes( key_words[i])) match = match +1;
            }
            if (key_words.length > 0 &&  match / key_words.length > 0.5) {
                console.log(article);
                return true;
            } else {
                return false;
            }
        } else return true;
    } else return false;
}


 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

module.exports = {

    createDBifNotExist,
    addOne,
    getAll,
    getAllIDMicrosoft,
    getALLByMicrosoftID,
    getEmptyInstance,
    writeArticles,
    getAllByBase,
    getByMicrosoftID,
    writeSearchArray,
    getDBbyType,
    cleanDB,
    isArticleMatching,
    ENUM

};