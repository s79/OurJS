(function() {
//==================================================[Widget - 定制对话框（封装模态对话框）]
  Widget.register({
    type: 'dialog-x',
    css: [
      '.widget-dialog-x { display: none; width: 500px; height: 300px; padding: 0; border: 1px solid #202020; outline: none; background: #424242; font: 14px/30px Verdana, Helvetica, Arial, "Microsoft YaHei", SimSun, sans-serif; }',
      '.widget-dialog-x .title { height: 31px; padding: 0 10px; background: url(title.png) repeat-x; color: whitesmoke; font-weight: bold; line-height: 31px; text-align: left; }',
      '.widget-dialog-x .close { position: absolute; right: 3px; top: 3px; width: 24px; height: 24px; outline: none; background: url(close.png) no-repeat center top; }',
      '.widget-dialog-x .close:hover { background-position: center bottom; }',
      '.widget-dialog-x iframe { display: block; width: 490px; height: 259px; margin: 5px; border: none; }'
    ],
    config: {
      titleText: '',
      contentSrc: 'about:blank'
    },
    initialize: function() {
      // 修改结构。
      this.insertAdjacentHTML('afterBegin', '<div class="title">' + this.titleText + '</div><a href="javascript:void(\'close\');" class="close" hidefocus></a>');

      // 监听 open 和 close 事件。
      this
          .on('open.x', function() {
            this.contentFrame = $('<iframe frameborder="no" scrolling="no" allowtransparency="true" src="' + this.contentSrc + '"></iframe>').insertTo(this);
          })
          .on('close.x', function() {
            this.contentFrame.remove();
          });

      // 使其具备 Dialog 的特性。
      Widget.parsers.dialog.parse(this);

    }
  });

})();
