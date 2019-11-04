var express = require('express');
var router = express.Router()
var scrapper = require('../scripts/scrapper');
var accessories_db = require('../database/accessories');
var xboxs_db = require('../database/xbox');
var surface_db = require('../database/surface');
var deals_db = require('../database/deals');
var articles = require('../database/articles');
var deviseFormater = require('../database/devise');
var devise_db = require('../database/devise');
var utils = require("../routes/utils")
var cors = require('cors');

// var schedule = require('node-schedule');
var auth = require('http-auth');
var basic = auth.basic({
  realm: 'HEY YOU'
}, function(username, password, callback) {
  callback(username == 'G97T5DYaWAYmG5L7dt6Rzju923eQf2W7yu84rUAQSc7nXr4c2w75' 
        && password == 'tJi75LV6c97kt7wDzQU48LqxGReGw9c2Vt745YqN9R76pZx52iTV');
});
var authMiddleware = auth.connect(basic);

var isDBLocked = false;
var isDbCreated = true;

if ( !isDbCreated) {
  articles.createDBifNotExist();
  accessories_db.createDBifNotExist();
  xboxs_db.createDBifNotExist();
  surface_db.createDBifNotExist();
  deals_db.createDBifNotExist();
  devise_db.createDBifNotExist();
  isDbCreated = true;
}




/* GET home page. */
router.get('/', function(req, res, next) {
  utils.forceLocalLang(req);
  console.log("local: " + req.getLocale());
  res.render('index', {
    title: 'Microsoft Store Checker',
    deals: !isDBLocked ? articles.getAllByBase(articles.ENUM.DEALS) : [],
    lang : utils.getLang(req, res).toLowerCase(),
    df : deviseFormater,
    isDBLocked : isDBLocked,
    cookieBanner : req.__('cookieBanner'),
    db_locked : req.__('db_locked'),
    db_locked2 : req.__('db_locked2'),
    content_text : { 
      navbar :  utils.getNavTrad( req),
      content1 : req.__('mainPage'),
      content2 : req.__('mainPage2')
    }
  });
});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/check/:type/:id', function(req, res, next) {
  utils.forceLocalLang(req);
  
  let navbarTrad = utils.getNavTrad( req);
  let tabHeader  = utils.getTabHeader(req);
  let type = req.param('type');
  let id = req.param('id');
  let db = articles.getDBbyType( type);

  if (true) {
    res.render('details', {     
       
      title: 'Microsoft Store Checker', 
      content_text : {    
        navbar :  navbarTrad,
        tabHeader : tabHeader
      },
      allObjects : !isDBLocked ? db.getALLByMicrosoftIDSorted(id) : [],
      article : !isDBLocked ? articles.getByMicrosoftID( id) : [],
      lang : utils.getLang(req, res).toLowerCase(),
      isDBLocked : isDBLocked,
      db_locked : req.__('db_locked'),
      db_locked2 : req.__('db_locked2'),
      df : deviseFormater,
      cookieBanner : req.__('cookieBanner')
     
    });

 
  } else {
    res.render('details', {

      title: 'Microsoft Store Checker',
      message : 'Content not found.',
      cookieBanner : req.__('cookieBanner'),
      content_text : {    
        navbar :  navbarTrad,
        tabHeader : tabHeader
      }
    })
  }


});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 router.get('/contacts', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('contacts', {
    
    title: 'Microsft Checker',
    lang : utils.getLang(req, res).toLowerCase(),
    cookieBanner : req.__('cookieBanner'),
    content_text : {    
      navbar :  utils.getNavTrad( req),
      contactTitle : req.__('contactTitle'),
      contact1 : req.__('contact1')
    }
  });
});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 router.get('/faq', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('faq', {
    title: 'Microsft Checker',
    cookieBanner : req.__('cookieBanner'),
    lang : utils.getLang(req, res).toLowerCase(),
    content_text : { 
      navbar :  utils.getNavTrad( req),
      faqTitle : req.__('faqTitle'),
      faqTitle2 : req.__('faqTitle2'),
      faqTitle3 : req.__('faqTitle3'),
      faqTitle4 : req.__('faqTitle4'),
      faqTitle5 : req.__('faqTitle5'),
      faqTitle6 : req.__('faqTitle6'),
      faqTitle7 : req.__('faqTitle7'),
      faqTitle8 : req.__('faqTitle8'),
      faq1 : req.__('faq1'),
      faq2 : req.__('faq2'),
      faq3 : req.__('faq3'),
      faq4 : req.__('faq4'),
      faq5 : req.__('faq5'),
      faq6 : req.__('faq6'),
      faq7 : req.__('faq7'),
      faq8 : req.__('faq8'),
      faq9 : req.__('faq9'),
    }});
});


 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/refreshDB', authMiddleware,function(req, res, next) {
  res.render('error', { message: 'DB REFRESH' ,error : {status :'Working...' , stack:''}});
  utils.forceLocalLang(req);
  // let all = req.param("all") === "false" ? false : true;

  isDBLocked = true;
  console.log("CRON : -- BEGIN --");
  scrapper.procedeToAllScrapFill( true)
    .then(()=> {
      console.log("CRON : All data are loaded !")
      isDBLocked = false;

    }).catch((err)=> {
      console.log("CRON : ERROR: Data are not loaded fully.");
      console.log(err);
      isDBLocked = false;
    });
});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 router.get('/refreshArticles', authMiddleware,function(req, res, next) {
  res.render('error', { message: 'DB REFRESH' ,error : {status :'Working...' , stack:''}});
  utils.forceLocalLang(req);
  // let all = req.param("all") === "false" ? false : true;

  isDBLocked = true;
  console.log("CRON : -- BEGIN --");
  scrapper.procedeToAllScrapFill( false)
    .then(()=> {
      console.log("CRON : All data are loaded !")
      isDBLocked = false;

    }).catch((err)=> {
      console.log("CRON : ERROR: Data are not loaded fully.");
      console.log(err);
      isDBLocked = false;
    });

});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 router.get('/refreshDevise', authMiddleware,function(req, res, next) {
  res.render('error', { message: 'DB DEVISE' ,error : {status :'Working...' , stack:''}});  
  isDBLocked = true;
  devise_db.updateDataBase();
  isDBLocked = false;

});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/xbox', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('products', {

    title: 'Microsoft Store Checker',
    products: !isDBLocked ? articles.getAllByBase(articles.ENUM.XBOX) : [],
    lang : utils.getLang(req, res).toLowerCase(),
    df : deviseFormater,
    isDBLocked : isDBLocked,
    cookieBanner : req.__('cookieBanner'),
    db_locked : req.__('db_locked'),
    db_locked2 : req.__('db_locked2'),
    content_text : { 
      title : "Xbox",
      navbar :  utils.getNavTrad( req)
  }
  });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/accessories', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('products', {
    title: 'Microsoft Store Checker',
    products: !isDBLocked ? articles.getAllByBase(articles.ENUM.ACCESSORIES) : [],
    lang : utils.getLang(req, res).toLowerCase(),
    df : deviseFormater,
    isDBLocked : isDBLocked,
    cookieBanner : req.__('cookieBanner'),
    db_locked : req.__('db_locked'),
    db_locked2 : req.__('db_locked2'),
    content_text : { 
      title : "Accessories",
      navbar :  utils.getNavTrad( req)
  }  });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/surface', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('products', {
    title: 'Microsoft Store Checker',
    products:  !isDBLocked ? articles.getAllByBase(articles.ENUM.SURFACE) : [],
    lang : utils.getLang(req, res).toLowerCase(),
    df : deviseFormater,
    isDBLocked : isDBLocked,
    db_locked : req.__('db_locked'),
    db_locked2 : req.__('db_locked2'),
    cookieBanner : req.__('cookieBanner'),
    content_text : { 
      title : "Surface",
      navbar :  utils.getNavTrad( req)
  }  });
});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 router.get('/deals', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('products', {
    title: 'Microsoft Store Checker',
    products: !isDBLocked ? articles.getAllByBase(articles.ENUM.DEALS) : [],
    lang : utils.getLang(req, res).toLowerCase(),
    df : deviseFormater,
    isDBLocked : isDBLocked,
    db_locked : req.__('db_locked'),
    db_locked2 : req.__('db_locked2'),
    cookieBanner : req.__('cookieBanner'),
    content_text : { 
      title : "Deals",
      navbar :  utils.getNavTrad( req)
  }  });
});

 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

 router.get('/search/:text', function(req, res, next) {
  let text = req.param('text');

  utils.forceLocalLang(req);

  res.render('search', {
    content_text : {    
      navbar :  utils.getNavTrad( req)
    },
    title: 'Microsoft Store Checker',
    products: !isDBLocked ? articles.getAll() :[],
    lang : utils.getLang(req, res).toLowerCase(),
    df : deviseFormater,
    isDBLocked : isDBLocked,
    db_locked : req.__('db_locked'),
    db_locked2 : req.__('db_locked2'),
    cookieBanner : req.__('cookieBanner'),
    isArticleMatching : articles.isArticleMatching,
    text : text,
    content_text : { 
      title : "Search",
      navbar :  utils.getNavTrad( req),
      tabHeader : utils.getTabHeader(req)
  }  });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/privacy', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('privacy', {
    title: 'Microsoft Store Checker',
    lang : utils.getLang(req, res).toLowerCase(),
    cookieBanner : req.__('cookieBanner'),
    content_text : { 
      title : "Privacy",
      navbar :  utils.getNavTrad( req)
  }  });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.get('/blog', function(req, res, next) {
  utils.forceLocalLang(req);

  res.render('blog', {
    title: 'Microsoft Store Checker',
    lang : utils.getLang(req, res).toLowerCase(),
    cookieBanner : req.__('cookieBanner'),
    content_text : { 
      title : "Blog",
      navbar :  utils.getNavTrad( req)
  }  });
});

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */

router.param('/product_names', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.end();
});

router.get('/product_names', cors(), function(req, res){
  articles.getByMicrosoftID("array_names").then((products) => {
    res.render('json', { object: products});
  });
});
 /*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */





module.exports = router;
