const connection = new(require('nosqlite').Connection)('./database');
const db = connection.database('accessories');

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
    // if (!db.existsSync() ) {
    //     db.createSync();
    // } else {
    //     db.destroySync();
    //     db.createSync();
    // }    
    MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
        db_mongo.collection('accessories', {}, function(err, xbox) {
            xbox.remove({}, function(err, result) {
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

 function addOneAccessory( objAccessory) {
    if ( objAccessory.id_microsoft && objAccessory.id_microsoft != '') {
        objAccessory.id = objAccessory.id_microsoft + "_" + objAccessory.lang;
        objAccessory.name = utils.uniformDescription( objAccessory.name);
        objAccessory.description = utils.uniformDescription( objAccessory.description);
        // db.postSync(objAccessory);

        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            if (err) {
              return console.log(err);
            }
            // Do something with db here, like inserting a record
            db_mongo.collection('accessories').insertOne( objAccessory,
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
    } else {
        console.log("ACCE not defined ");
    }
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

function getAllAccessories() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            db_mongo.collection('accessories').find({}).toArray(function(err, result) {
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
    let all = await getAllAccessories();
    let all_accesories = [];
    let tmp = null;

    for (let i=0; i < all.length; i++) {
        tmp = all[i];
        if ( tmp.id_microsoft === microsoft_id) {
            all_accesories.push(tmp);
        }
    }
    return all_accesories;
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
    let all = await getAllAccessories();
    let all_accesories = [];
    let tmp = null;

    for (let i=0; i < all.length; i++) {
        tmp = all[i];
        if ( tmp.lang === lang) {
            all_accesories.push(tmp);
        }
    }
    return all_accesories;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
async function getAllIDMicrosoft() {
    let all =  await getAllAccessories();
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
 async function getAccessoryByLangAndMicrosoftID(lang, microsoft_id) {
    let all =  await getAllAccessories();
    let all_accesories = [];
    let tmp = null;

    for (let i=0; i < all.length; i++) {
        tmp = all[i];
        if ( tmp.lang === lang && tmp.microsoft_id == microsoft_id) {
            all_accesories.push(tmp);
        }
    }
    return all_accesories;
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
 function updateALLUSDPrice() {
    let all = getAllAccessories();
    let tmp;
    console.log("update--");
    for( let i=0; i< all.length; i++) {
        tmp = all[i];
        console.log(tmp.price);
        
        tmp.usd_price = devise_db.getUSDValue( tmp.price, tmp.devise.name);


        // db.putSync(tmp.id, tmp);
        MongoClient.connect(MONGO_URL, (err, db_mongo) => {  
            if (err) {
              return console.log(err);
            }
            db_mongo.collection("accessories").updateOne({"id_microsoft" : tmp.id}, newvalues, function(err, res) {
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
        let tmp_id = -1;
        let price_tmp =  Number.MAX_SAFE_INTEGER;
    
        for( let i = 0; i < all.length; i++) {
            // console.log(all[i].usd_price + " - " + all[id].lang);

            if ( all[i].usd_price < price_tmp && all[i].usd_price > 0) {
                tmp_id = i;
                price_tmp = all[i].usd_price;
            }
        }
        if ( tmp_id != -1) {
            // console.log("----> " + all[tmp_id].usd_price);
            return(all[tmp_id]);
        } else {
            return(null);
        }    
}

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

module.exports = {

    createDBifNotExist,
    addOneAccessory,
    getAllAccessories,
    getAllIDMicrosoft,
    getALLByMicrosoftID,
    getALLByLang,
    getAccessoryByLangAndMicrosoftID,
    getEmptyInstance,
    updateALLUSDPrice,
    getCheapestByMicrosoftID,
    getALLByMicrosoftIDSorted
};

