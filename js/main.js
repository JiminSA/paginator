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
  
  _drawIcon($('.downloadIcon canvas'), [[100, 25], [200, 25], [200, 75], [250, 75], [150, 125], [50, 75], [100, 75]], '#00bffb');

  function _drawIcon($canvas, path, color) {
    var ctx = $canvas.get(0).getContext("2d");

    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);

    for (var i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0], path[i][1]);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
});
