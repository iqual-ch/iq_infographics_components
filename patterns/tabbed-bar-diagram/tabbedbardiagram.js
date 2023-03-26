(function ($, Drupal) {

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
          let max = Math.max(...element.bars.map(bar => Number(bar.value)));
          element.bars.forEach(bar => {
            let $bar = $('<div class="bar uninitialized">');
            let value = Number(bar.value);

            $bar.attr('data-label', bar.label);
            $bar.height(value / max * 100 + '%');
            $tabContent.append($bar);

            $tabContent.on('animate-bar-counter', function(){
              $bar.animateBarCounter(value);
            });
          });

          $tabContentWrapper.append($tabContent);
          $tabWrapper.append($tab);
        });
        $(this).append($tabContentWrapper).append($tabWrapper);

        let observer = new IntersectionObserver(
          ([e]) => {
            console.log(e.intersectionRatio);
            if (e.intersectionRatio > 0) {
              $diagramWrapper.removeClass('iq-tabbed-bar-diagram__body--hidden');
              $tabWrapper.children(":first").click();
            }
          },
          { threshold: [0], rootMargin: `0px 0px 0px 0px` }
        );
        observer.observe($diagramWrapper.get(0));
      }
    });
  });
})(jQuery, Drupal);


