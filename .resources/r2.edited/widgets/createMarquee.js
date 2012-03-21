/**
 * @name createMarquee
 * @author sundongguo
 * @version 20080911
 */
//--------------------------------------------------[createMarquee]
function createMarquee($target) {
  function scroll() {
    animation.play();
    timer = null;
    setTimer();
  }

  function setTimer() {
    if (!timer) {
      timer = setTimeout(scroll, 3000);
    }
  }

  function clearTimer() {
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timer = null;
  }

  var aD = $target.getElementsByTagName("div");
  var scrollTopCurrent = 0;
  var step = $target.offsetHeight;
  var timer = null;
  var animation = FX.createAnimation({
    before: function() {
      scrollTopCurrent = $target.scrollTop;
    },
    tween: function(x) {
      $target.scrollTop = scrollTopCurrent + step * x;
    },
    after: function() {
      if ($target.scrollTop == (aD.length - 1) * step) {
        $target.scrollTop = 0;
      }
    },
    mode: "easeIn",
    duration:300
  });
  $target.scrollTop = 0;
  $target.appendChild(aD[0].cloneNode(true));
  EventManager.bind($target, "DOMMouseEnter", clearTimer);
  EventManager.bind($target, "DOMMouseLeave", setTimer);
  setTimer();
}
