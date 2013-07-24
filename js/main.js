$(document).ready(function () {
  var menuButton = $('#menu ul li'),
      webPage = $('.webPage');

  var init =  function () {
    webPage.each(function () {
      $(this).height(($(this).height() >= window.innerHeight - 110) ? $(this).height() : 
          window.innerHeight - 110)
    });
  }
  init();

  menuButton.click(function () {
    var positionTop = 0;
    for (i = 0; i <= $(this).index() - 1; i++) {
      positionTop += webPage.eq(i).outerHeight(true);
    }
    window.scrollTo(0, positionTop);
  });

  $(window).scroll(function () {
    for (i = 0; i < webPage.length; i++) {
      if (window.scrollY >= webPage.eq(i).position().top + 109) { 
        menuButton.removeClass('selected');
        menuButton.eq(i).addClass('selected');
      }
    }
  });
    
  $(window).resize(function () {
    init();
  });
});
