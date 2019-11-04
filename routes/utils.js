function getLocalUpper(lang) {
    let part1 = lang.charAt(0) + lang.charAt(1);
    let part2 = lang.charAt(3) + lang.charAt(4);
    return part1 + "-" + part2.toUpperCase();
  }

  
function getLang(req, res) {
    var local = req.getLocale();
    var cookie = req.cookies.lang;
    if ( cookie ) {
        console.log("cookie: "+cookie[0]+cookie[1]);

        return cookie;
    } else {
        console.log("local: "+ local);
        return local;
    }
}
  
function forceLocalLang(req) {
    if (req.cookies.lang) {
        req.setLocale(getLocalUpper(req.cookies.lang));
    }
}


function getNavTrad( req) {
    return {   
      xbox : req.__('navbarXbox'),
      accessory : req.__('navbarAccessory'),
      surface : req.__('navbarSurface'),
      deals : req.__('navbarDeals'),
      fonction : req.__('navbarFonction'),
      contact : req.__('navbarContact'),
      search : req.__('navbarSearch'),
      footerDesc : req.__('footerDesc'),
      links : req.__('links'),
      articles : req.__('article')
    };
}
  
function getTabHeader( req) {
    return {   
      price : req.__('price'),
      name : req.__('name'),
      link : req.__('link'),
      country : req.__('country')
    };
}

module.exports  = {
    getTabHeader,
    getNavTrad,
    forceLocalLang,
    getLocalUpper,
    getLang
    
};
  