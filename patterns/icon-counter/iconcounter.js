(function ($, Drupal) {

  $.fn.animateCounter = function(value) {
    value = Number(value);
    let startTimestamp = null;
    let $counter = $(this);
    // $counter.parent().find('.bar').addClass('uninitialized');

    if ($counter.hasClass('initialized')) {
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 2000, 1);
      $counter.text((progress * value).toLocaleString('de-CH', {
        maximumFractionDigits: Number.isInteger(value) ? 0 : 2
      }));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
    $counter.addClass('initialized');

    return this;
  };

  $(document).ready(function () {
    $('[data-counter-value]').each(function(){
      let $counter = $(this);


      let observer = new IntersectionObserver(
        ([e]) => {
          if (e.intersectionRatio > 0) {
            $counter.animateCounter($counter.data('counter-value'));
          }
        },
        { threshold: [0], rootMargin: `0px 0px 0px 0px` }
      );
      observer.observe($counter.get(0));


    })
  });
})(jQuery, Drupal);


