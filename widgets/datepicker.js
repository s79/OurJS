/**
 * @fileOverview Widget - 日期选择器
 * @author sundongguo@gmail.com
 * @version 20121025
 */

(function() {
//==================================================[Widget - 日期选择器]
//--------------------------------------------------[$panel]
  /*
   * “日期选择面板”的结构：
   * <div class="datepicker-panel">
   *   <div class="control_set">
   *     <span class="btn prev_year" data-action="prev_year">«</span>
   *     <span class="btn prev_month" data-action="prev_month">‹</span>
   *     <span class="year">0000</span>-<span class="month">00</span>
   *     <span class="btn next_month" data-action="next_month">›</span>
   *     <span class="btn next_year" data-action="next_year">»</span>
   *   </div>
   *   <div class="widget-calendar" data-month="0000-00" data-first-day="1"></div>
   *   <div class="control_set">
   *     <span class="btn clear" data-action="clear">清除</span>
   *     <span class="btn today" data-action="today">今天</span>
   *   </div>
   * </div>
   */
  var $panel = document.$('<div class="datepicker-panel"><div class="control_set"><span class="btn prev_year" data-action="prev_year">«</span><span class="btn prev_month" data-action="prev_month">‹</span><span class="year">0000</span>-<span class="month">00</span><span class="btn next_month" data-action="next_month">›</span><span class="btn next_year" data-action="next_year">»</span></div><div class="widget-calendar" data-month="0000-00" data-first-day="1"></div><div class="control_set"><span class="btn clear" data-action="clear">清除</span><span class="btn today" data-action="today">今天</span></div></div>');

  // “日期选择面板”的目标对象。
  var $datePicker;

  // 更新“日期选择面板”时需要的日期数据。
  var minDate;
  var maxDate;
  var selectedDate;
  var today;

  // 获取元素。
  var $calendar = $panel.find('.widget-calendar');
  var controls = $panel.findAll('span');
  var $prevYear = controls[0];
  var $prevMonth = controls[1];
  var $year = controls[2];
  var $month = controls[3];
  var $nextMonth = controls[4];
  var $nextYear = controls[5];
  var $clear = controls[6];
  var $today = controls[7];

  // 解析月历。
  Widget.parse($calendar.on('cellupdate', function(e) {
    var $cell = e.cell;
    var date = e.date;
    // 禁用超出范围的日期。
    if (date < minDate || date > maxDate) {
      $cell.addClass('disabled');
      $cell.title = '';
    } else {
      $cell.removeClass('disabled');
      $cell.title = date.format();
    }
    // 高亮选中的日期。
    if (selectedDate && selectedDate.getTime() === date.getTime()) {
      $cell.addClass('selected');
    }
  }));

  // 为“日期选择面板”添加新方法。
  Object.mixin($panel, {
    show: function() {
      $panel.setStyle('display', 'block');
      window.on('scroll.datepicker, resize.datepicker', navigator.isIE6 ? function() {
        setTimeout(function() {
          $panel.reposition();
        }, 0);
      } : function() {
        $panel.reposition();
      });
      document.on('mousedown.datepicker', function(e) {
        var $target = e.target;
        if (!$datePicker.contains($target) && !$panel.contains($target)) {
          $panel.hide();
        }
      });
      $panel.update().reposition();
      return $panel;
    },
    hide: function() {
      $panel.setStyle('display', 'none');
      window.off('scroll.datepicker, resize.datepicker');
      document.off('mousedown.datepicker');
      return $panel;
    },
    reposition: function() {
      var datePickerClientRect = $datePicker.getClientRect();
      var panelClientRect = $panel.getClientRect();
      var datePickerheight = panelClientRect.height;
      var currentX = panelClientRect.left;
      var currentY = panelClientRect.top;
      var expectedX = datePickerClientRect.left;
      var expectedY = datePickerClientRect.bottom;
      if (expectedY + datePickerheight > window.getClientSize().height && datePickerClientRect.top >= datePickerheight) {
        expectedY -= datePickerheight + datePickerClientRect.height;
      }
      $panel.setStyles({left: parseInt($panel.getStyle('left'), 10) + expectedX - currentX, top: parseInt($panel.getStyle('top'), 10) + expectedY - currentY});
      return $panel;
    },
    update: function(month) {
      // 确保 month 在允许的范围之间。
      if (!month) {
        month = (selectedDate || new Date()).format('YYYY-MM');
      }
      month = new Date(Math.limit(Date.parseExact(month, 'YYYY-MM').getTime(), minDate.getTime(), maxDate.getTime())).format('YYYY-MM');
      // 更新控制区指示。
      var showYM = month.split('-');
      var showY = Number.toInteger($year.innerText = showYM[0]);
      var showM = Number.toInteger($month.innerText = showYM[1]) - 1;
      // 设置翻页按钮。
      var minY = minDate.getFullYear();
      var minM = minDate.getMonth();
      var maxY = maxDate.getFullYear();
      var maxM = maxDate.getMonth();
      if (showY === minY) {
        $prevYear.addClass('disabled').title = '';
      } else {
        $prevYear.removeClass('disabled').title = '上一年';
      }
      if (showY === minY && showM === minM) {
        $prevMonth.addClass('disabled').title = '';
      } else {
        $prevMonth.removeClass('disabled').title = '上一月';
      }
      if (showY === maxY && showM === maxM) {
        $nextMonth.addClass('disabled').title = '';
      } else {
        $nextMonth.removeClass('disabled').title = '下一月';
      }
      if (showY === maxY) {
        $nextYear.addClass('disabled').title = '';
      } else {
        $nextYear.removeClass('disabled').title = '下一年';
      }
      // 设置“清除”和“今天”按钮。
      if ($datePicker.value === '') {
        $clear.addClass('disabled').title = '';
      } else {
        $clear.removeClass('disabled').title = '清除选定的日期';
      }
      today = Date.parseExact(new Date().format());
      if (today < minDate || today > maxDate) {
        $today.addClass('disabled').title = '';
      } else {
        $today.removeClass('disabled').title = '选择今天的日期';
      }
      // 更新月历。
      $calendar.update(month);
      return $panel;
    },
    setValue: function(value) {
      if ($datePicker.value !== value) {
        $datePicker.highlight('red', 'color').value = value;
        $datePicker.fire('change');
      }
      return $panel;
    },
    clearValue: function() {
      if ($datePicker.value !== '') {
        $datePicker.highlight('whitesmoke').value = '';
        $datePicker.fire('change');
      }
      return $panel;
    }
  });

  $panel
      .on('click:relay(td)', function() {
        // 为“日期选择器”赋值。
        var value = this.title;
        if (value) {
          $panel.hide().setValue(value);
        }
        return false;
      })
      .on('click:relay(.btn)', function() {
        // 点击控制按钮，仅在控制按钮没有被禁用的情况下有效。
        var action = this.getData('action');
        if (action && !this.hasClass('disabled')) {
          var year = Number.toInteger($year.innerText);
          var month = Number.toInteger($month.innerText);
          var lastYear = year;
          var lastMonth = month;
          switch (action) {
            case 'prev_year':
              --year;
              break;
            case 'prev_month':
              if (month === 1) {
                month = 12;
                --year;
              } else {
                --month;
              }
              break;
            case 'next_month':
              if (month === 12) {
                month = 1;
                ++year;
              } else {
                ++month;
              }
              break;
            case 'next_year':
              ++year;
              break;
            case 'clear':
              $panel.hide().clearValue();
              return false;
            case 'today':
              $panel.hide().setValue(today.format());
              return false;
          }
          $panel.update(year + '-' + month.padZero(2));
          if (lastYear !== year) {
            $year.highlight('red', 'color');
          }
          if (lastMonth !== month) {
            $month.highlight('red', 'color');
          }
        }
        return false;
      })
      .on('mousewheel', function(e) {
        // 支持鼠标滚轮更新月历（滚轮翻月，Shift + 滚轮翻年）。
        if (e.wheelUp) {
          (e.shiftKey ? $prevYear : $prevMonth).fire('click');
        }
        if (e.wheelDown) {
          (e.shiftKey ? $nextYear : $nextMonth).fire('click');
        }
        return false;
      })
      .on('mousedown', function() {
        // 阻止一些浏览器的划选动作。
        return false;
      });

  document.on('beforedomready', function() {
    $panel.insertTo(document.body);
  });

//--------------------------------------------------[activatePanel]
  // 在指定的“日期选择器”附近显示“日期选择面板”。
  var activatePanel = function() {
    minDate = Date.parseExact(this.getData('minDate') || '1900-01-01');
    maxDate = Date.parseExact(this.getData('maxDate') || '9999-12-31');
    selectedDate = this.value ? Date.parseExact(this.value, 'YYYY-MM-DD') : null;
    $datePicker = this;
    $panel.show();
  };

//--------------------------------------------------[DatePicker]
  /**
   * “日期选择器”可以通过点选的方式来选择一个日期，它仍是一个表单控件。
   * @name DatePicker
   * @constructor
   * @attribute data-min-date
   *   指定允许选择的最小日期，格式为 YYYY-MM-DD。
   *   如果不指定本属性，则使用 '1900-01-01' 作为默认值。
   *   在“日期选择器”被解析后，对本属性的值的修改仍然可以生效。
   * @attribute data-max-date
   *   指定允许选择的最大日期，格式为 YYYY-MM-DD。
   *   如果不指定本属性，则使用 '9999-12-31' 作为默认值。
   *   在“日期选择器”被解析后，对本属性的值的修改仍然可以生效。
   * @fires change
   *   选定的值改变时触发。
   *   本事件用于模拟真实发生在表单域元素上的 change 事件。
   * @requires Calendar
   * @description
   *   <strong>启用方式：</strong>
   *   为一个 INPUT[type=text] 元素添加 'widget-datepicker' 类，即可使该元素成为“日期选择器”。
   *   <strong>结构约定：</strong>
   *   “日期选择器”会自动在文档中创建一个“日期选择面板”（其中包含一个“月历”），并利用它来进行日期的点选。所有的“日期选择器”共用一个“日期选择面板”。
   *   在“日期选择面板”中，类名包含 'btn' 的为按钮，类名包含 'prev_year' 的为“上一年”按钮，类名包含 'prev_month' 的为“上一月”按钮，类名包含 'next_month' 的为“下一月”按钮，类名包含 'next_year' 的为“下一年”按钮，类名包含 'clear' 的为“清除”按钮，类名包含 'today' 的为“今天”按钮。另外如果一个按钮处于禁用状态，将为其添加类名 'disabled'。
   *   <strong>新增行为：</strong>
   *   “日期选择器”将不再能由键盘输入值。点击该元素时，将弹出“日期选择面板”，在面板中选中的日期会被回填到该元素中。
   *   如果“日期选择器”已经有选定值，点击“日期选择面板”的“清除”按钮可以清除该值。
   *   如果今天在可选日期范围（取决于 data-min-date 和 data-max-date 的设定值）内，点击“今天”按钮可以将今天的日期作为选定值。
   *   在“日期选择面板”中，可以通过点击“上一年”和“下一年”按钮或使用鼠标滚轮翻年，通过点击“上一月”和“下一月”按钮或使用 Shift + 鼠标滚轮翻月。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .datepicker-panel { display: none; position: absolute; left: 0; top: 0; width: 218px; padding: 6px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); border: 1px solid silver; border-radius: 3px; background: whitesmoke; color: navy; font: 14px/20px Verdana, Helvetica, Arial, SimSun, serif; cursor: default; }
   *   .datepicker-panel div.control_set { position: relative; height: 22px; line-height: 22px; text-align: center; }
   *   .datepicker-panel span.btn { position: absolute; top: 0; width: 28px; height: 20px; border: 1px solid silver; border-radius: 2px; background: white; color: black; line-height: 20px; }
   *   .datepicker-panel span.btn:hover, .datepicker-panel tbody td:hover { box-shadow: 0 0 2px rgba(178, 34, 34, 0.75); border-color: firebrick; background: lightyellow; }
   *   .datepicker-panel span.disabled, .datepicker-panel span.disabled:hover, .datepicker-panel tbody td.disabled, .datepicker-panel tbody td.disabled:hover { box-shadow: none; border-color: whitesmoke; background: whitesmoke; color: gainsboro; }
   *   .datepicker-panel span.prev_year { left: 1px; }
   *   .datepicker-panel span.prev_month { left: 32px; }
   *   .datepicker-panel span.next_year { right: 1px; }
   *   .datepicker-panel span.next_month { right: 32px; }
   *   .datepicker-panel table { margin: 2px 0; }
   *   .datepicker-panel thead td { border-color: whitesmoke; }
   *   .datepicker-panel tbody td { background: white; }
   *   .datepicker-panel tbody td.selected, .datepicker-panel tbody td.selected:hover { box-shadow: none; border-color: firebrick; background: crimson; color: white; font-weight: bold; }
   *   .datepicker-panel span.clear { left: 1px; width: 61px; }
   *   .datepicker-panel span.today { right: 1px; width: 61px; }
   *   </pre>
   */

  Widget.register({
    type: 'datepicker',
    css: [
      '.datepicker-panel { display: none; position: absolute; left: 0; top: 0; width: 218px; padding: 6px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); border: 1px solid silver; border-radius: 3px; background: whitesmoke; color: navy; font: 14px/20px Verdana, Helvetica, Arial, SimSun, serif; cursor: default; }',
      '.datepicker-panel div.control_set { position: relative; height: 22px; line-height: 22px; text-align: center; }',
      '.datepicker-panel span.btn { position: absolute; top: 0; width: 28px; height: 20px; border: 1px solid silver; border-radius: 2px; background: white; color: black; line-height: 20px; }',
      '.datepicker-panel span.btn:hover, .datepicker-panel tbody td:hover { box-shadow: 0 0 2px rgba(178, 34, 34, 0.75); border-color: firebrick; background: lightyellow; }',
      '.datepicker-panel span.disabled, .datepicker-panel span.disabled:hover, .datepicker-panel tbody td.disabled, .datepicker-panel tbody td.disabled:hover { box-shadow: none; border-color: whitesmoke; background: whitesmoke; color: gainsboro; }',
      '.datepicker-panel span.prev_year { left: 1px; }',
      '.datepicker-panel span.prev_month { left: 32px; }',
      '.datepicker-panel span.next_year { right: 1px; }',
      '.datepicker-panel span.next_month { right: 32px; }',
      '.datepicker-panel table { margin: 2px 0; }',
      '.datepicker-panel thead td { border-color: whitesmoke; }',
      '.datepicker-panel tbody td { background: white; }',
      '.datepicker-panel tbody td.selected, .datepicker-panel tbody td.selected:hover { box-shadow: none; border-color: firebrick; background: crimson; color: white; font-weight: bold; }',
      '.datepicker-panel span.clear { left: 1px; width: 61px; }',
      '.datepicker-panel span.today { right: 1px; width: 61px; }'
    ],
    initialize: function() {
      if (this.nodeName === 'INPUT' && this.type === 'text') {
        this.readOnly = true;
        this.on('click.datepicker', activatePanel);
      }
    }
  });

})();
