$(document).ready(function() {

  // Cookies.remove('lang');
   // Initialisation cookie de lang
  //  console.log( $("html").attr("lang"));
  if ( typeof Cookies.get('lang') === 'undefined') {
    let lang2 = $("html").attr("lang");
    Cookies.set('lang', lang2);
  }

  $( "#lang-select" ).change(function() {
    let lang2 = $( "#lang-select option:selected" ).val();    
    let lang_UPPER = getLocalUpper(lang2);

    Cookies.set('lang', lang_UPPER);  // Le cookie en maj fr-FR
    $("html").attr("lang", lang_UPPER);  // LE select aussi en upper
    location.reload();

  });

  $('.selectpicker').selectpicker({});
  $('.selectpicker').selectpicker('val', getLocalUpper($("html").attr("lang")));
  $('.selectpicker').selectpicker('refresh');
    // create sidebar and attach to menu open
    
    $( ".autocomplete" ).autocomplete({
      source:  function(request, response) {
        // Load the products names
        // var url = window.location.href;
        $.getJSON( getBaseUrl()+"/product_names", function(json) {
          let lang = $("input[lang]").attr("lang");
          let data = json[lang.substring(0,2)];
          data = data.concat( json["en"]);
          var results = $.ui.autocomplete.filter(data, request.term);  
          response(results.slice(0, 10));
          
        });        
     },
     select: function( event, ui ) {
      $( "#search-item" ).val( ui.item.key); //ui.item is your object from the array
        var args = ui.item.key.split("_");
        if ( args.length == 2) {
          $(location).attr('href','/check/' + args[0] + '/' + args[1]);
        }
      }
     
    }); 
    
  $("#btn-search-item").click(()=> {
    let search_item = $( "#search-item" ).val();  
    if ( search_item == "" ) search_item = "null";  
    console.log(search_item);
    $(location).attr('href','/search/'+ encodeURIComponent(search_item));    
  });

   // Traitement des tables
   $("#price-comparaison tbody tr:first").addClass("table-success");
   // Agranddiseement barre de recherche.
    $("#search-box").click(function(){
      if ( $( window ).width() >1440 ) {
        $('#search-box').animate({width: "300px"});
      }
    });

    $("#search-box").focusout(function(){
      $('#search-box').animate({width: "230px"});
    });

    /* carrousel */
    $('#deals-carrousel').slick({
      dots: true,
      infinite: false,
      speed: 2000,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ],     
      nextArrow: '<div class="slick-next slick-arrow"><span class="badge badge-pill span-link"><img src="/images/arrow_go.svg"></span></div>',
      prevArrow: '<div class="slick-prev slick-arrow"><span class="badge badge-pill span-link"><img src="/images/arrow_back.svg"></span></div>', 
    });
    
    

  faqMenuHide();
  /* Hide navbar of faq when too smaller*/
  $( window ).resize(function() {
    faqMenuHide();
  });

  $( document ).scroll(function() {
    let prct =($(document).scrollTop()/$(document).height())*100;
    if ( prct <= 70 ) {
      // $( "#faq-sum" ).fadeTo( 200 , 1);
      $( "#faq-sum" ).css( "opacity" , 1);


    } else if (prct >= 70 ) {      
      console.log("ok");
      // $( "#faq-sum" ).fadeTo( 200 , 0);
      $( "#faq-sum" ).css( "opacity" , 0);

    }
  });


  /* offset for link faq */
  $("#faq-sum a").on('click', function(event) {
    var offset = 90;
    if (this.hash !== "") {  
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
          scrollTop: $(hash).offset().top -offset
        }, 800, function(){
      });
    }  
  });

    
});


function getLocalUpper(lang) {
  let part1 = lang.charAt(0) + lang.charAt(1);
  let part2 = lang.charAt(3) + lang.charAt(4);
  return part1 + "-" + part2.toUpperCase();
}

function faqMenuHide() {
  if ( $(window).width() < 766 ) {
    $( "#faq-sum" ).css("display", "none");  
  } else {
    $( "#faq-sum" ).css("display", "block");  
  }
}

function getBaseUrl() {
  return "http://"+extractHostname(window.location.href);
}

function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("://") > -1) {
      hostname = url.split('/')[2];
  }
  else {
      hostname = url.split('/')[0];
  }

  //find & remove port number
  // hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}

// To address those who want the "root domain," use this function:
function extractRootDomain(url) {
  var domain = extractHostname(url),
      splitArr = domain.split('.'),
      arrLen = splitArr.length;

  //extracting the root domain here
  //if there is a subdomain 
  if (arrLen > 2) {
      domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
      //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
      if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
          //this is using a ccTLD
          domain = splitArr[arrLen - 3] + '.' + domain;
      }
  }
  return domain;
}


