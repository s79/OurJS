(function() {
//==================================================[Widget - 简单对话框（封装模态对话框）]
  // 简单对话框。除 Dialog 具备的特性外，未增加新特性，仅修改了对话框自身的结构和外观。
  Widget.register('simple-dialog', {
    css: [
      '.widget-simple-dialog { display: none; border: 5px solid steelblue; background: white; outline: none; font: 14px/21px Verdana, Helvetica, Arial, "Microsoft YaHei", SimSun, sans-serif; }',
      '.widget-simple-dialog .dialog-close { position: absolute; right: 3px; top: 3px; width: 20px; height: 20px; color: steelblue; font-size: 20px; line-height: 20px; text-decoration: none; outline: none; }',
      '.widget-simple-dialog .dialog-close:hover { color: #00CCFF; }',
      '.widget-simple-dialog .content { padding: 5px; }'
    ],
    initialize: function() {
      // 修改结构。
      var $dialog = this;
      $('<a href="javascript:void(\'close\');" class="dialog-close" hidefocus>×</a>')
          .on('click', function() {
            $dialog.close();
          })
          .insertTo($dialog, 'afterBegin');
      // 主动解析。
      Widget.parsers.dialog($dialog);
    }
  });

})();
