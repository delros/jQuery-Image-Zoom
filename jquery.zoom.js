// Fork of the Zoom 1.4 - jQuery image zooming plugin
// [author] by Ernesto del Rosario
// [git] https://github.com/delros/zoom

// Original credentials:
// Zoom 1.4 - jQuery image zooming plugin
// (c) 2012 Jack Moore - jacklmoore.com
// license: www.opensource.org/licenses/mit-license.php

(function ($) {

  var methods = {
    init: function (options) {
      return this.each(function() {
        var $this = $(this)
          , settings = $this.data('zoom')
          , root = this
          , $root = $(root)
          , img = new Image()
          , $img = $(img)
          , $icon
          , position = $root.css('position')
          , mousemove = 'mousemove' 
          , clicked = false;

        if (typeof(settings) == 'undefined') {

          var defaults = {
            url: false,
            icon: false,
            callback: false,
            duration: 120,
            on: 'mouseover' // 'grab' or 'click'
          }
          
          settings = $.extend({}, defaults, options);

          $this.data('zoom', settings);
        } else {
          settings = $.extend({}, settings, options);
        }

        // Original plugin source code [start]

        // The parent element needs positioning so that the zoomed element can be correctly positioned within.
        $root.css({
          position: /(absolute|fixed)/.test(position) ? position : 'relative',
          overflow: 'hidden'
        });

        // If a url wasn't specified, look for an image element.
        if (!settings.url) {
          settings.url = $root.find('img').attr('src');
          if (!settings.url) {
            return;
          }
        }

        if (settings.icon) {
          $icon = $('<div class="zoomIcon"/>').appendTo($root);
        }

        img.onload = function () {
          var outerWidth
            , outerHeight 
            , xRatio 
            , yRatio
            , left
            , top
            , offset = $root.offset();

          function ratio() {
            outerWidth = $root.outerWidth();
            outerHeight = $root.outerHeight();
            xRatio = (img.width - outerWidth) / outerWidth;
            yRatio = (img.height - outerHeight) / outerHeight;
          }

          function move(e) {
            left = (e.pageX - offset.left);
            top = (e.pageY - offset.top);

            if (left > outerWidth) {
              left = outerWidth;
            } else if (left < 0) {
              left = 0;
            }

            if (top > outerHeight) {
              top = outerHeight;
            } else if (top < 0) {
              top = 0;
            }

            img.style.left = (left * -xRatio) + 'px';
            img.style.top = (top * -yRatio) + 'px';

            e.preventDefault();
          }

          function start(e) {
            offset = $root.offset();
            ratio();
            move(e);

            // Skip the fade-in for IE8 and lower since it chokes on fading-in
            // and changing position based on mousemovement at the same time.
            $img.stop()
              .fadeTo($.support.opacity ? settings.duration : 0, 1);
          }

          function stop() {
            $img.stop()
            .fadeTo(settings.duration, 0);
          }

          $img.addClass('zoomImg')
            .css({
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0,
              width: img.width,
              height: img.height,
              border: 'none',
              maxWidth: 'none'
            })
            .appendTo($root);

          if (settings.on === 'grab') {
            $img.mousedown(
              function (e) {
                offset = $root.offset();

                $(document).one('mouseup', function () {
                    stop();
                    $(document).unbind(mousemove, move);
                  }
                );

                start(e);

                $(document)[mousemove](move);
                
                e.preventDefault();
              }
            );
          } else if (settings.on === 'click') {
            $img.click(function(e){
              if (clicked) {
                  // bubble the event up to the document 
                  // to trigger the unbind.
                  return;
              } else {
                clicked = true;
                start(e);

                $(document)[mousemove](move);

                $(document).one('click',
                  function () {
                    stop();
                    clicked = false;
                    $(document).unbind(mousemove, move);
                  }
                );

                return false;
              }
            });
          } else {
            // Pre-emptively call ratio because 
            // IE7 will fire the mousemove callback 
            // before the hover callback.
            ratio(); 
            $img.hover(start, stop)[mousemove](move);
          }
  
          if ($.isFunction(settings.callback)) {
            settings.callback.call(img);
          }
        };

        img.src = settings.url;

        // Original plugin source code [end]
      });
    },
    destroy: function (options) {
      return $(this).each(function() {
        var $this = $(this);

        $this.find('.zoomImg').remove();
        $this.removeData('zoom');

        return;
      });         
    }
  };

  $.fn.zoom = function() {
    var method = arguments[0];

    if (methods[method]) {
      method = methods[method];
      arguments = Array.prototype.slice.call(arguments, 1);
    } else if (typeof(method) == 'object' || !method) {
      method = methods.init;
    } else {
      $.error('Method ' +  method + ' does not exist');
      return this;
    }

    return method.apply(this, arguments);
  }

}(jQuery));