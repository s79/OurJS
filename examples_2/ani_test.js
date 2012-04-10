execute(function($) {
//--------------------------------------------------[clips]
  var frames = 0;
  var reverse = true;
  var $layer = $('#layer').setStyle('opacity', 1);

//--------------------------------------------------[addClip]
  window.animation = new Animation()
      .on('start',
      function() {
        frames = 0;
        if (this.status === 'reverse') {
          $layer.empty().innerHTML = 'Moving...';
        }
//        console.log('START', this.timestamp);
      })
      .on('step',
      function() {
        frames++;
//        console.log(this.timeline);
//        console.log('STEP', this.timestamp);
      })
      .on('pause',
      function() {
//        console.log('PAUSE', this.timestamp);
      })
      .on('end',
      function() {
        $layer.empty().append($('<span>Done! FPS: ' + frames + '</span>'));
//        $layer.empty().append($('<span>Done! FPS: ' + frames + '</span>').animate(null, {duration: 1000}).fadeOut({onEnd: function() {
//          this.remove();
//        }}));
//        console.log('END', this.timestamp);
//        reverse ? animation.reverse() : animation.play();
//        reverse = !reverse;
      })
      .on('stop', function() {
        console.log('STOP', this.timestamp);
      })
      .on('statuschange',
      function(e) {
        console.log('STATUS: ' + ' '.repeat(10) + this.status, e.from, e.to);
      })
      .addClip(function(x, y) {
        $layer.setStyles({width: Math.floor(200 + 300 * y)});
      }, {
        transition: 'ease',
        delay: 500,
        duration: 200
      })
      .addClip(function(x, y) {
        $layer.toggleClass('highlight');
      }, {
        transition: 'linear',
        delay: 500,
        duration: 0
      })
      .addClip(function(x, y) {
//        console.log('>>>', x, y);
        var heightAndLineHeight = Math.floor((20 + 280 * y)) + 'px';
        $layer.setStyles({
          left: Math.floor(700 - 225 * y),
          top: Math.floor(600 - 500 * y),
          height: heightAndLineHeight,
          lineHeight: heightAndLineHeight
//          opacity: (y > 0.6 ? 0.6 : y).toFixed(2)
        });
      }, {
        transition: 'cubicBezier(.25,1.25,.75,-0.25)',
        delay: 0,
        duration: 1000
      });

//--------------------------------------------------[controls]
  document.on('keydown', function(e) {
    switch (e.which) {
      case 37:
        animation.pause();
        animation.reverse();
        return false;
      case 38:
        animation.stop();
        return false;
      case 39:
        animation.pause();
        animation.play();
        return false;
      case 40:
        animation.pause();
        return false;
    }
  });
  $('#play2').on('click', function() {
    animation.play();
  });
  $('#reverse2').on('click', function() {
    animation.reverse();
  });
  $('#pause2').on('click', function() {
    animation.pause();
  });
  $('#stop2').on('click', function() {
    animation.stop();
  });

}, true);
