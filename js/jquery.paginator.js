/**
 * jquery.paginator.js v1.0.0
 * A jQuery plugin that controls the pagination of multiple pages.
 * Copyright (c) 2012-2013 Luke Chang <iamlukechang@gmail.com>
 * Released under the MIT license
 * Requires jQuery v1.9.0 or later
 */
(function ($) {
  // plugin
  $.fn.paginator = function (options) {

    this.viewport = $('.viewport', this);
    this.pages = $('.pages', this);
    this.type = this.pages.prop('tagName');
    this.pageIndexBar = $('.pageIndexBar', this);
    this.pageSelector = $('.pageSelector', this);
    this.pageInput = $('.pageInput', this);
    this.pageNumberViewport = $('.pageNumberViewport', this);

    var that = this,
        opts,
        callback;

    // handle the first argument
    if (typeof options == 'string') {
      $.fn.paginator.apis[arguments[0]].call(this, arguments[1], arguments[2]);
      return this;
    } else if (typeof options == 'function') {
      opts = $.fn.paginator.defaults;  
      callback = arguments[0];
    } else {
      opts = $.extend({}, $.fn.paginator.defaults, options);  
      callback = arguments[1];
    }

    this.pageIndexBar.data('displayNumber', opts.displayNumber);

    // add styles
    this.addClass('paginator');

    // generate the first, prev, next, last buttons, and the page number viewport in the index bar
    this.pageIndexBar.html('<div class="firstButton"><canvas class="firstIcon"></canvas></div>' + 
        '<div class="prevButton"><canvas class="prevIcon"></canvas></div>' +
        '<div class="pageNumberViewport"></div>' +
        '<div class="nextButton"><canvas class="nextIcon"></canvas></div>' + 
        '<div class="lastButton"><canvas class="lastIcon"></canvas></div>');
    this.pageNumberViewport = $('.pageNumberViewport', this);

    // set button style and get the button color
    $(".firstButton, .prevButton, .nextButton, .lastButton", this).addClass('pageIndexButton');
    var buttonColor = $('.pageIndexButton', this).css('color')

    // cannot call method getContext of undefined
    if (this.pageIndexBar.length != 0) {
      var firstIcon = $('.firstIcon', this.pageIndexBar),
          prevIcon = $('.prevIcon', this.pageIndexBar),
          nextIcon = $('.nextIcon', this.pageIndexBar),
          lastIcon = $('.lastIcon', this.pageIndexBar);
      _drawIcon(firstIcon, [[190, 25], [90, 70], [190, 115]], buttonColor);
      _drawIcon(firstIcon, [[90, 25], [90, 115], [70, 115], [70, 25]], buttonColor);
      _drawIcon(prevIcon, [[190, 25], [90, 70], [190, 115]], buttonColor);
      _drawIcon(nextIcon, [[110, 25], [210, 70], [110, 115]], buttonColor);
      _drawIcon(lastIcon, [[110, 25], [210, 70], [110, 115]], buttonColor);
      _drawIcon(lastIcon, [[210, 25], [210, 115], [230, 115], [230, 25]], buttonColor);
    };

    // initialize
    if (opts.autoPagination == true) {
      // auto pagination initialize
      $(window).load(function () {
        _paginate.call(that);

        _init.call(that);

        // callback function 
        if ($.isFunction(callback)) {
          callback.call(this);
        }
      });
    } else {
      // normal initialize
      _init.call(this);

      // callback function 
      if ($.isFunction(callback)) {
        callback.call(this);
      }
    }

    // handle index bar controller 
    $('.firstButton', this.pageIndexBar).click(function () {
      _select.call(that, 1);
    });

    $('.prevButton', this.pageIndexBar).click(function () {
      var pageId = that.data('currentPageId') - 1;
      _select.call(that, pageId);
    });

    $('.nextButton', this.pageIndexBar).click(function () {
      var pageId = that.data('currentPageId') + 1;
      _select.call(that, pageId);
    });

    $('.lastButton', this.pageIndexBar).click(function () {
      _select.call(that, $('.page', that).length);
    });

    // handle dropdown selector 
    this.pageSelector.change(function () {
      var pageId = parseInt(that.pageSelector.find('option:selected').val());
      _select.call(that, pageId);
    });

    // handle input box 
    this.pageInput.change(function () {
      var pageId = parseInt(that.pageInput.val());
      _select.call(that, pageId);
    });

    if (opts.swipe == true) {
      _handleTouch.call(this);
    }

    return this;
  };

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

  function _init() {

    var pageSelector = this.pageSelector,
        width = this.viewport.width(),
        pages = this.pages,
        page = $('.page', this);
    
    // set up pages and page dimentions
    pages.width(width * page.length);
    width = (this.type == 'TABLE') ? 
        width - _parsePx(pages, 'border-spacing') :
        width ;
    page.each(function () {
      var margin = _parsePx($(this), 'padding-left') + 
          _parsePx($(this), 'padding-right') + 
          _parsePx($(this), 'border-left-width')+
          _parsePx($(this), 'border-right-width')+
          _parsePx($(this), 'margin-left') + 
          _parsePx($(this), 'margin-right'); 

      // jQuery .width(value) for table element will include border in Non-Firefox browsers
      if (navigator.userAgent.match('Firefox') == null && $(this).prop('tagName') == 'TABLE') {
        margin = _parsePx($(this), 'margin-left') + 
            _parsePx($(this), 'margin-right'); 
      }

      $(this).width(width - margin);
    });

    // add options into the pageSelector
    pageSelector.empty();
    page.each(function (index) {
      var pageId = index + 1;
      var pageTitle = ($(this).attr('title')) ? $(this).attr('title') : pageId;
  
      pageSelector.append('<option value=' + pageId + '>' + pageTitle + '</option>');
    });

    // clear float to force the pages element to be the correct height
    pages.append('<div style="clear: both;"></div>');

    _initIndexBar.call(this);
    _select.call(this, 1);
  }

  function _initIndexBar() {
  
    var that = this; 
        pageLength = $('.page', this).length,
        displayNumber = this.pageIndexBar.data('displayNumber');

    // empty the pageNumber eiewport and regenerate wrapper and each button
    this.pageNumberViewport.empty().html('<div class="pageNumberWrapper"></div>');
    var pageNumberWrapper = $('.pageNumberWrapper', this);

    // generate the index buttons in the index bar
    for (var i = 0; i < pageLength; i++) {
      var pageId = i + 1;
      $('<div></div>').html(pageId).appendTo(pageNumberWrapper)
          .addClass('pageIndexButton pageNumber')
          .bind('click', function () {
            var pageId = parseInt($(this).text());
            _select.call(that, pageId);
          });
    }

    var pageNumberWidth = $('.pageNumber', this).outerWidth(true);

    //fix the page number wrapper width
    pageNumberWrapper.width(pageNumberWidth * pageLength);

    // adjust viewport width according to the display number
    this.pageNumberViewport.width((pageLength > displayNumber) ? 
        pageNumberWidth * displayNumber :
        pageNumberWidth * pageLength);
  }

  function _select(pageId, method) {

    var page = $('.page', this); 

    if (pageId > 0 && pageId <= page.length) {

      // select page
      if (method == 'swipe') {
        this.pages.animate({"left": -page.outerWidth(true) * (pageId - 1)}, 200);
      } else {
        this.pages.css({"left": -page.outerWidth(true) * (pageId - 1)});
      }

      // onselect event
      page.eq(pageId - 1).trigger('selectPage');

      // select
      _selectIndexBar.call(this, pageId);
      this.pageSelector.val(pageId);
      this.pageInput.val(pageId);

      // update current page id
      this.data('currentPageId', pageId);
    }
  }

  function _selectIndexBar(pageId) {

    var pageLength = $('.page', this).length, 
        pageNumber = $('.pageNumber', this),
        pageNumberWidth = pageNumber.outerWidth(true),
        pageNumberWrapper = $('.pageNumberWrapper', this);
        displayNumber = this.pageIndexBar.data('displayNumber');

    var leftNumber = Math.ceil(displayNumber / 2),
        rightNumber = Math.floor(displayNumber / 2);
  
    pageNumber.removeClass('selected').eq(pageId - 1).addClass('selected');

    // index numbers moving animation
    if (pageLength > displayNumber) {
      if (pageId <= leftNumber) {
        pageNumberWrapper.animate({"left": 0});
      } else if (pageId > leftNumber && pageId < pageLength - rightNumber) {
        pageNumberWrapper.animate({"left":  -(pageId - leftNumber) * pageNumberWidth + "px"});
      } else if (pageId >= pageLength - rightNumber) {
        pageNumberWrapper.animate({"left":  -(pageLength - displayNumber) * pageNumberWidth + "px"});
      }
    }
  }

  function _paginate() {
    var type = (this.type == 'TABLE') ? 'tbody' : 'div', 
        pageHeight = 0,
        elements = [],
        height = this.viewport.height();
    var elementHeights = [],
        page = $();

    this.pages.children().each(function () {
      var elementHeight = $(this).outerHeight(true);
      elementHeights.push(elementHeight);
      elements.push($(this));
      // BUG: There will be problems with each element height if the elements include tags other than div 
      /*
      if (pageHeight + elementHeight < height) {
        pageHeight += elementHeight;
        elements = elements.add(this);
      } else {
        elements.wrapAll('<' + type +' class="page" />');
        pageHeight = elementHeight;
        elements = $(this);
      }
      */
    });
    for (var i = 0; i < elementHeights.length; i++) {
      if (pageHeight + elementHeights[i] < height) {
        pageHeight += elementHeights[i];
        page = page.add(elements[i]);
      } else {
        page.wrapAll('<' + type +' class="page" />');
        pageHeight = elementHeights[i];
        page = elements[i];
      }
    }
    page.wrapAll('<' + type + ' class="page" />');
  }

  function _handleTouch() {
    var startX = 0,
        moveX = 0,
        that = this,
        currentPageId,
        width = this.viewport.width();

    this.viewport.on('touchstart', function (e) {
      startX = e.originalEvent.targetTouches[0].pageX;
      currentPageId = that.data('currentPageId');
    });

    this.viewport.on('touchmove', function (e) {
      e.preventDefault();
      moveX = e.originalEvent.targetTouches[0].pageX;
      var pagesLeftMovement = - (currentPageId - 1) * width + moveX - startX,
          pagesLeft = - $('.page', that).outerWidth(true) * ($('.page', that).length - 1);
      if (pagesLeftMovement < 0 && pagesLeftMovement >= pagesLeft) {
        that.pages.css({"left": pagesLeftMovement});
      }
    });

    this.viewport.on('touchend', function (e) {
      var delX = moveX - startX;
      if (delX > 0) {
        var pageId = (delX >= width / 3) ? currentPageId - 1 : currentPageId;
        _select.call(that, pageId, 'swipe');
      } else if (delX < 0) {
        var pageId = (delX <= - width / 3) ? currentPageId + 1 : currentPageId;
        _select.call(that, pageId, 'swipe');
      } else {
        _select.call(that, currentPageId, 'swipe');
      }
    });

    this.viewport.on('touchleave', function (e) {
      e.preventDefault();
      _select.call(that, currentPageId, 'swipe');
    });

    this.viewport.on('touchcancel', function (e) {
      e.preventDefault();
      _select.call(that, currentPageId, 'swipe');
    });
  }

  function _parsePx($obj, style) {
    if ($obj.css(style) == '') return 0;
    return parseInt($obj.css(style).replace(/px/, ''));
  }

  // default options
  $.fn.paginator.defaults= {
    autoPagination: false,
    displayNumber: 9,
    swipe: true 
  };

  // APIs
  $.fn.paginator.apis = {
    'initPaginator': _init,
    'selectPage': _select,
    'insertPage': function (pageId, pageObj) {
      var newPage = $('<div class="page">' + pageObj.content + '</div>'),
          index = pageId - 1;
      if (pageObj.title) {
        newPage.attr('title', pageObj.title);
      }
      (index < $('.page', this).length) ? newPage.insertBefore($('.page:eq(' + index + ')', this)) : 
          newPage.appendTo(this.pages);
      _init.call(this);
    },
    'updatePage': function (pageId, pageObj) {
      var selectedPage = $('.page', this).eq(pageId - 1).html(pageObj.content);
      if (pageObj.title) {
        selectedPage.attr('title', pageObj.title);
      }
      _init.call(this);
    },
    'removePage': function (pageId) {
      $('.page', this).eq(pageId - 1).remove();
      _init.call(this);
    } 
  };
})(jQuery);
