/**
 * @fileOverview 控件 - 日期选择器。
 * @author sundongguo@gmail.com
 * @version 20121025
 */

(function() {
//==================================================[控件 - 日期选择器]
  var $panel;

//--------------------------------------------------[createPanel]
  /**
   * 创建日期选择器面板。
   * @name createPanel
   * @function
   * @private
   */
  var createPanel=function(minDate, maxDate, month) {


  };

//--------------------------------------------------[activatePanel]
  /**
   * 在指定的日期选择器控件附近显示日期选择器面板。
   * @name activatePanel
   * @function
   * @private
   * @param {Element} $target 日期选择器控件。
   */
  var activatePanel = function($target) {
    // 提取需要的值。
    var minDate = $target.getData('minDate');
    var maxDate = $target.getData('maxDate');
    var month = $target.value ? $target.value.slice(0, 7) : new Date().format('YYYY-MM');

    // 转换上述值的数据类型，并确保 month 在允许的范围之间。
    minDate = Date.from(minDate || '1900-01-01');
    maxDate = Date.from(maxDate || '9999-12-31');
    var showDate = new Date(Math.limit(Date.from(month, 'YYYY-MM').getTime(), minDate.getTime(), maxDate.getTime()));
    month = showDate.format('YYYY-MM');

    console.log(minDate, maxDate, month);

    // 第一次调用时创建。
    if ($panel) {
      $panel.update(minDate, maxDate, month)
    } else {
      createPanel(minDate, maxDate, month);
    }

    $panel.setStyle('display', 'block');
    // 定位。

    // 使用 Calendar 控件创建 DatePicker 面板。
    var $datePicker = $('<div class="datepicker-panel"><div class="control_set"><span class="btn prev_year" data-action="prev_year">«</span><span class="btn prev_month" data-action="prev_month">‹</span><span class="year">0000</span><span>-</span><span class="month">00</span><span class="btn next_month" data-action="next_month">›</span><span class="btn next_year" data-action="next_year">»</span></div><div class="widget-calendar" data-month="' + month + '"></div><div class="control_set"><span class="btn clear" data-action="clear">清除</span><span class="btn today" data-action="today">今天</span></div></div>').insertTo(document.body);
    // 获取元素。
    var controlSets = $datePicker.find('div');
    var $topControlSet = controlSets[0];
    var $calendar = controlSets[1];
    var $bottomControlSet = controlSets[2];
    var controls = $datePicker.find('span');
    var $prevYear = controls[0];
    var $prevMonth = controls[1];
    var $year = controls[2];
    var $month = controls[4];
    var $nextMonth = controls[5];
    var $nextYear = controls[6];
    var $clear = controls[7];
    var $today = controls[8];

    // 保存属性。
    Object.mixin($datePicker, {
      calendar: $calendar,
      minDate: minDate,
      maxDate: maxDate,
      elements: {
        topControlSet: $topControlSet,
        bottomControlSet: $bottomControlSet,
        prevYear: $prevYear,
        prevMonth: $prevMonth,
        year: $year,
        month: $month,
        nextMonth: $nextMonth,
        nextYear: $nextYear,
        clear: $clear,
        today: $today
      }
    });

    // 点击控制按钮，仅在控制按钮没有被禁用的情况下有效。
    $datePicker.on('click.datepicker:relay(.btn)', function(event) {
      var action = this.getData('action');
      if (action && !this.hasClass('disabled')) {
        var year = Number.toInteger($year.innerText);
        var month = Number.toInteger($month.innerText);
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
        $calendar.update(year + '-' + month.padZero(2));
      }
      return false;
    });

    // 绑定事件。
    $datePicker
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
    $calendar
        .on('update', function(event) {
          // 更新控制区指示。
          var showDateValues = event.month.split('-');
          var showY = Number.toInteger($year.innerText = showDateValues[0]);
          var showM = Number.toInteger($month.innerText = showDateValues[1]) - 1;
          var minY = $datePicker.minDate.getFullYear();
          var minM = $datePicker.minDate.getMonth();
          var maxY = $datePicker.maxDate.getFullYear();
          var maxM = $datePicker.maxDate.getMonth();
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
          } else {
            $cell.removeClass('disabled');
            $cell.title = date.format();
          }
          // 高亮选中的日期。
          if (this.selectedDate && this.selectedDate.getTime() === date.getTime()) {
            $cell.addClass('selected');
          }
        });

    // 解析 Calendar 控件。
    Widget.parse($calendar);

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
      this.readOnly = true;

      // 绑定事件。
      this.on('click.datepicker', function() {
        activatePanel(this);
      });
    }
  });

})();
