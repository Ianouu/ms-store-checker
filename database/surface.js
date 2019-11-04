const connection = new(require('nosqlite').Connection)('./database');
const db = connection.database('surface');

var devise_db = require('../database/devise.js');
var utils = require('../database/database_utils.js');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = require('./mongo_config').MONGO_URL;



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
    MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
        db_mongo.collection('surface', {}, function(err, surface) {
            surface.remove({}, function(err, result) {
                if (err) console.log(err);                    
                db_mongo.close();
            });
        });
    });  
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 function getEmptyInstance() {
    return {
        'id_microsoft' : "",
        'lang' : "",
        'name' : "",
        'price' : "",
        'url_img' : "",
        'usd_price' : "",
        'description' : "",
        'devise' : {
            "name" : "",
            "symbole" : ""
        }
    };    
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 function addOne( obj) {
    if ( obj.id_microsoft && obj.id_microsoft != '') {
        obj.id = obj.id_microsoft + "_" + obj.lang;
        obj.name = utils.uniformDescription( obj.name);
        obj.description = utils.uniformDescription( obj.description);
        // db.postSync(obj);
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            if (err) {
              return console.log(err);
            }
            // Do something with db here, like inserting a record
            db_mongo.collection('surface').insertOne( obj,
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

        // db.post(obj, function(error) {
        //     if (error) throw error;
        // });
    } else {
        console.log("not defined: "+obj.lang);
    }
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAll() {
    return new Promise((resolve, result) => {
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            db_mongo.collection('surface').find({}).toArray(function(err, result) {
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
    let all = await getAll();
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

 async function getALLByMicrosoftIDSorted(microsoft_id) {
    let all = await getALLByMicrosoftID(microsoft_id);

    function compare(a,b) {
        return a.usd_price - b.usd_price;
    }
      
    all.sort(compare);
    return all;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 async function getALLByLang(lang) {
    let all =  await getAll();
    let all_tmps = [];
    let tmp = null;

    for (let i=0; i < all.length; i++) {
        tmp = all[i];
        if ( tmp.lang === lang) {
            all_tmps.push(tmp);
        }
    }
    return all_tmps;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
async function getAllIDMicrosoft() {
    let all =  await getAll();
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

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
 async function getCheapestByMicrosoftID( id) {
    let all = await getALLByMicrosoftID( id);
    let min_uuid;
    let min_price = Number.MIN_SAFE_INTEGER;

    for( let i = 0; i < all.length; i++) {
        if ( all[i].usd_price > min_price && all[i].usd_price > 0) {
            min_uuid = all[i].id;
            min_price = all[i].usd_price;
        }
    }    
    if ( min_uuid !== -1) {
        // return(db.getSync(min_uuid));
    } else {
        return(null);
    }
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

// {
//     'name'
//     'min_price'
//     'url_img'
// }
async function getAllPresentation() {

    let all_id_microsoft = await getAllIDMicrosoft();
    let result = [];
    let tmp_result = {
        'name' : "",
        "min_price" : "",
        "url_img" : ""
    }
    let tmp;
    for( let i = 0; i < all_id_microsoft.length; i++) {
        tmp = await getCheapestByMicrosoftID( all_id_microsoft[i]);
        if ( tmp ) {
            tmp_result.url_img = tmp.url_img;
            tmp_result.name = tmp.name;
            tmp_result.min_price = tmp.usd_price;
            result.push( tmp_result);
        }

    }

    return result;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
async function getByLangAndMicrosoftID(lang, microsoft_id) {
    let all =  await getAll();
    let all_tmps = [];
    let tmp = null;

    for (let i=0; i < all.length; i++) {
        tmp = all[i];
        if ( tmp.lang === lang && tmp.microsoft_id == microsoft_id) {
            all_tmps.push(tmp);
        }
    }
    return all_tmps;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
 async function updateALLUSDPrice() {
    let all = await getAll();
    let tmp;

    for( let i=0; i< all.length; i++) {
        tmp = all[i];        
        tmp.usd_price = devise_db.getUSDValue( tmp.price, tmp.devise.name);

        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            if (err) {
                return console.log(err);
            }
            db_mongo.collection("surface").updateOne({"id_microsoft" : tmp.id}, newvalues, function(err, res) {
                if (err) throw err;
                db_mongo.close();
            });
        });
    }


}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */


 async function getCheapestByMicrosoftID( id) {
    // return new Promise((resolve, reject) => {
        let all = await getALLByMicrosoftID( id);
        let id_tmp = -1;
        let price_tmp =  Number.MAX_SAFE_INTEGER;
    
        for( let i = 0; i < all.length; i++) {
            if ( all[i].usd_price < price_tmp && all[i].usd_price > 0) {
                id_tmp = i;
                price_tmp = all[i].usd_price;
            }
        }
        if ( id_tmp != -1) {
            return(all[id_tmp]);
        } else {
            return(null);
        }    
}
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

module.exports = {

    createDBifNotExist,
    addOne,
    getAll,
    getAllIDMicrosoft,
    getALLByMicrosoftID,
    getALLByLang,
    getByLangAndMicrosoftID,
    getEmptyInstance,
    updateALLUSDPrice,
    getAllPresentation,
    getCheapestByMicrosoftID,
    getALLByMicrosoftIDSorted

};

