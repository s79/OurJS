/**
 * @fileOverview 控件 - 日期选择器。
 * @author sundongguo@gmail.com
 * @version 20121025
 */

(function() {
//==================================================[控件 - 日期选择器]
//--------------------------------------------------[$panel]
  // 所有的日期选择器控件公用一个日期选择面板。
  /*
   * 日期选择面板的结构：
   * <div class="datepicker-panel">
   *   <div class="control_set">
   *     <span class="btn prev_year" data-action="prev_year">«</span>
   *     <span class="btn prev_month" data-action="prev_month">‹</span>
   *     <span class="year">0000</span>-<span class="month">00</span>
   *     <span class="btn next_month" data-action="next_month">›</span>
   *     <span class="btn next_year" data-action="next_year">»</span>
   *   </div>
   *   <div class="widget-calendar" data-month="0000-00"></div>
   *   <div class="control_set">
   *     <span class="btn clear" data-action="clear">清除</span>
   *     <span class="btn today" data-action="today">今天</span>
   *   </div>
   * </div>
   */
  var $panel = $('<div class="datepicker-panel"><div class="control_set"><span class="btn prev_year" data-action="prev_year">«</span><span class="btn prev_month" data-action="prev_month">‹</span><span class="year">0000</span>-<span class="month">00</span><span class="btn next_month" data-action="next_month">›</span><span class="btn next_year" data-action="next_year">»</span></div><div class="widget-calendar" data-month="0000-00"></div><div class="control_set"><span class="btn clear" data-action="clear">清除</span><span class="btn today" data-action="today">今天</span></div></div>').insertTo(document.body);

  // 获取元素。
  var $calendar = $panel.find('.widget-calendar')[0];
  var controls = $panel.find('span');
  var $prevYear = controls[0];
  var $prevMonth = controls[1];
  var $year = controls[2];
  var $month = controls[3];
  var $nextMonth = controls[4];
  var $nextYear = controls[5];
  var $clear = controls[6];
  var $today = controls[7];

  var minDate;
  var maxDate;
  var selectedDate;

  $calendar
      .on('update', function(event) {
        // 更新控制区指示。
        var showYM = event.month.split('-');
        var showY = Number.toInteger($year.innerText = showYM[0]);
        var showM = Number.toInteger($month.innerText = showYM[1]) - 1;
        var minY = minDate.getFullYear();
        var minM = minDate.getMonth();
        var maxY = maxDate.getFullYear();
        var maxM = maxDate.getMonth();
        // 设置控制按钮。
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
      })
      .on('cellupdate', function(event) {
        var $cell = event.cell;
        var date = event.date;
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
      });

  // 解析 Calendar 控件。
  Widget.parse($calendar);

  // 更新日期选择面板。
  $panel.update = function(month) {
    // 确保 month 在允许的范围之间。
    if (!month) {
      month = (selectedDate || new Date()).format('YYYY-MM');
    }
    month = new Date(Math.limit(Date.from(month, 'YYYY-MM').getTime(), minDate.getTime(), maxDate.getTime())).format('YYYY-MM');
    // 更新月历。
    $calendar.update(month);
  };

  // 激活（显示并定位）日期选择面板。
  $panel.reposition = function() {

  };

  $panel
      .on('click.datepicker:relay(.btn)', function() {
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
//            datePicker.clearValue().hide();
              break;
            case 'today':
//            datePicker.setValue(today.format()).hide();
              break;
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
      .on('mousewheel', function(event) {
        // 支持鼠标滚轮更新月历（滚轮翻月，Shift + 滚轮翻年）。
        if (event.wheelUp) {
          (event.shiftKey ? $prevYear : $prevMonth).fire('click');
        }
        if (event.wheelDown) {
          (event.shiftKey ? $nextYear : $nextMonth).fire('click');
        }
        return false;
      })
      .on('mousedown', function() {
        // 阻止一些浏览器的划选动作。
        return false;
      });

//--------------------------------------------------[activatePanel]
  // 在指定的日期选择器控件附近显示日期选择面板。
  var activatePanel = function() {
    minDate = Date.from(this.getData('minDate') || '1900-01-01');
    maxDate = Date.from(this.getData('maxDate') || '9999-12-31');
    selectedDate = this.value ? Date.from(this.value, 'YYYY-MM') : null;
    // 显示日期选择面板。
    console.log(minDate.format(), maxDate.format(), selectedDate);
    $panel.update();//.activate(this);
  };

//--------------------------------------------------[DatePicker]
  /**
   * 日期选择器。
   * @name DatePicker
   * @constructor
   * @attribute data-min-date
   *   指定允许选择的最小日期，格式为 YYYY-MM-DD。
   *   如果不指定本属性，则使用 '1900-01-01' 作为默认值。
   * @attribute data-max-date
   *   指定允许选择的最大日期，格式为 YYYY-MM-DD。
   *   如果不指定本属性，则使用 '9999-12-31' 作为默认值。
   * @description
   *   为 INPUT[type=text] 元素添加 'widget-datepicker' 类，即可使该元素成为日期选择器控件。
   *   当该元素成为日期选择器控件后，将不能再由键盘输入值，但当点击该元素时，将弹出日期选择面板，在面板中选中的日期将自动回填到该元素中。
   */

  Widget.register('datepicker', {
    initialize: function() {
      // 另本元素变成只读。
      this.readOnly = true;
      // 绑定事件。
      this.on('click.datepicker', activatePanel);
    }
  });

})();
