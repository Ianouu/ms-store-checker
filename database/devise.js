var oxr = require('open-exchange-rates');
var Decimal = require('decimal.js');    
var currencyFormatter = require('currency-formatter');
var countriesInfo = require('countries-information');
const connection = new(require('nosqlite').Connection)('./database');
const db = connection.database('devise');
const ID_RATES = "DEVISE";


function getUSDValue (value, devise) {
    let result = 0;
    let taux = db.getSync(ID_RATES) 

    if (taux) {
        let tx_usd = new Decimal( taux.rates["USD"]);
        let tx_dvs = new Decimal( taux.rates[devise]); 
        let change = tx_usd.dividedBy(tx_dvs);
        let result = new Decimal(value).times( change);
         
        return result.toFixed(2);
    } else {
        return -1;
    }
};


function getDeviseValue (valueUSD, devise) {
    let result = 0;
    let taux = db.getSync(ID_RATES) 
    let tx_dvs;
    if (taux) {
        valueUSD = new Decimal(valueUSD);
        tx_dvs = new Decimal( taux.rates[devise])  ;          
        result = valueUSD.times(tx_dvs);
        return result.toFixed(2);
    } else {
        return -1;
    }
};

function getDeviseValueByRegion(valueUSD, region) {
    let region_code = region.substring(3,5).toUpperCase();
    let curr = countriesInfo.getCountryInfoByCode(region_code).currencies ? countriesInfo.getCountryInfoByCode(region_code).currencies[0] : "";
    return getDeviseValue(valueUSD, curr);
}


function getDeviseToDevise (value1, devise1, devise2) {
    let result = 0;
    let taux = db.getSync(ID_RATES) 
    let value1USD = getUSDValue(value1, devise1);
    return getDeviseValue(value1USD, devise2);
};

function updateDataBase () {
    oxr.set({ app_id: API_ID })

    oxr.latest(function() {
        db.get(ID_RATES, function(err, obj) {
            if (!err) {
                db.deleteSync(ID_RATES);        
            } 
            addDevise( {
                'id' : ID_RATES,
                'rates' : oxr.rates
            });
            
        });       
    });
}

function addDevise( objAccessory) {
    db.postSync(objAccessory);
}

function getStrByUsdRegion(valueUSD, region) {
    let region_code = region.substring(3,5).toUpperCase();
    let curr = countriesInfo.getCountryInfoByCode(region_code).currencies ? countriesInfo.getCountryInfoByCode(region_code).currencies[0] : "";
    return currencyFormatter.format( getDeviseValue(valueUSD, curr), { code: curr });
}

function getStrByValueDevise(value, devise) {
    return currencyFormatter.format( value, { code: devise });
}

function getCountryName(region) {
    let region_code = region.substring(3,5).toUpperCase();
    let name = countriesInfo.getCountryInfoByCode(region_code) ? countriesInfo.getCountryInfoByCode(region_code).name : lang;
    return name;
}

function createDBifNotExist() {
    if (!db.existsSync() ) {
        db.createSync();
    }
}


module.exports = {
    getUSDValue,
    createDBifNotExist,
    updateDataBase,
    getDeviseValue,
    getDeviseToDevise,
    getDeviseValueByRegion,
    getStrByUsdRegion,
    getCountryName,
    getStrByValueDevise
};