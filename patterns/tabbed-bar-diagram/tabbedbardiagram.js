(function ($, Drupal) {

  // Calculate titles height for each row
  function calcTitleHeight() {

    $('.iq-tabbed-bar-diagram__header').css('height', '');

    if ($(window).width() < 768) {
      return;
    };

    let $rows = $('.container-fluid .iq-row:has(> .iq-column > .iq-tabbed-bar-diagram)');
    $rows.each(function () {
      $titles = $(this).find('.iq-tabbed-bar-diagram__header');
      let titleHeights = $titles.map(function () {
        return $(this).outerHeight()
      }).get();

      let maxTitleHeight = Math.max.apply(null, titleHeights);

      $titles.each(function () {
        if ($(this).height() != maxTitleHeight) {
          $(this).css('height', maxTitleHeight);
        }
      });

    });
  };

  $.fn.animateBarCounter = function(value) {
    value = Number(value);
    let startTimestamp = null;
    let $bar = $(this);
    $bar.parent().find('.bar').addClass('uninitialized');

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 2000, 1);
      $bar.attr('data-value', (progress * value).toLocaleString('de-CH', {
        maximumFractionDigits: Number.isInteger(value) ? 0 : 2
      }));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
    window.setTimeout(function(){
      $bar.removeClass('uninitialized');
    }, 10);

    return this;
  };

  $(document).ready(function () {
    $('[data-tabbed-bar-diagram]').each(function () {
      let $diagramWrapper = $(this);
      let data = jsyaml.load($diagramWrapper.text());
      $diagramWrapper.html('');
      let $tabContentWrapper = $('<div class="iq-tabbed-bar-diagram__tab-content-wrapper">');
      let $tabWrapper = $('<div class="iq-tabbed-bar-diagram__tab-wrapper">');
      let min = 0;

      if (Array.isArray(data)) {
        data.forEach(element => {

          // Set up tabs.
          let $tab = $('<button>' + element.tab + '</button>');
          let $tabContent = $('<div>').hide();
          $tab.click(function () {
            if (!$(this).hasClass('active')) {
              $(this).addClass('active').siblings().removeClass('active');
              $tabContent.show().siblings().hide();
              $tabContent.siblings().find('.bar').addClass('uninitialized');
              $tabContent.trigger('animate-bar-counter');
            }
          });

          // Generate Bars.
          let max = Math.max(...element.bars.map(bar => isNaN(Number(bar.value)) ? 0 : Number(Math.abs(bar.value))));
          element.bars.forEach(bar => {
            let $bar = $('<div class="bar uninitialized">');
            let value = Number(bar.value);
            let barHeight = 0;

            if (isNaN(value)) {
              $bar.attr('data-value', bar.value);
            }
            else {
              barHeight = Math.abs(value) / max * 100;
              $tabContent.on('animate-bar-counter', function () {
                $bar.animateBarCounter(value);
              });
            }

            $bar.height(barHeight + '%');

            if (value < 0) {
              $bar.addClass('negative');
              min = Math.max(min, barHeight);
            }

            $bar.attr('data-label', bar.label);
            $bar.attr('data-suffix', bar.suffix);
            $tabContent.append($bar);
          });

          $tabContentWrapper.append($tabContent);
          $tabWrapper.append($tab);
        });
        $(this).append($tabContentWrapper).append($tabWrapper);

        let observer = new IntersectionObserver(
          ([e]) => {
            if (e.intersectionRatio > 0) {
              $diagramWrapper.removeClass('iq-tabbed-bar-diagram__body--hidden');
              if (!$tabWrapper.find('.active').length) {
                $tabWrapper.children(":first").click();
              }
              if (min) {
                let wrapperHeight = $tabContentWrapper.height();
                $tabContentWrapper.css('padding-bottom', (wrapperHeight * min / 100) + 'px');
                $tabContentWrapper.css('height', (wrapperHeight + wrapperHeight * min / 100) + 'px');
              }
            }
          },
          { threshold: [0], rootMargin: `0px 0px 0px 0px` }
        );
        observer.observe($diagramWrapper.get(0));
      }
    });

    calcTitleHeight();
  });

  $(window).resize(function () {
    calcTitleHeight();
  });
})(jQuery, Drupal);


