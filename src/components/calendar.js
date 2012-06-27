/**
 * @fileOverview 组件 - 月历。
 * @author sundongguo@gmail.com
 * @version 20120329 (update from 20080528)
 */
// TODO: DatePicker 通过封装 Calendar 实现，需修改相关参数。
execute(function($) {
//==================================================[Calendar]
  /*
   * 创建月历。
   */

//--------------------------------------------------[Calendar Constructor]
  /**
   * 月历。
   * @name Calendar
   * @constructor
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Calendar.options 中。
   * @param {number} options.firstDayOfWeek 指定每周的第一天是星期几，取值范围为 0 - 6，默认为 0，即星期日。
   * @param {string} options.theme 主题样式，即创建的最外层 DOM 元素的 className，默认为 'calendar'。
   * @param {string} options.minDate 最小日期，格式为 YYYY-MM-DD，默认为 1900-01-01。
   * @param {string} options.maxDate 最大日期，格式为 YYYY-MM-DD，默认为 2100-12-31。
   * @param {string} options.selectedDate 选定的日期，格式为 YYYY-MM-DD，默认为 undefined，即无选定的日期。
   * @fires render
   *   {string} renderedMonth 渲染的月份，格式为 YYYY-MM 的字符串。
   *   日期渲染后触发。
   * @fires select
   *   {string} selectedDate 选定的日期，格式为 YYYY-MM-DD 的字符串。
   *   选定日期后触发。
   * @fires change
   *   {string} selectedDate 当前选定的日期，格式为 YYYY-MM-DD 的字符串。
   *   {string} lastSelectedDate 之前选定的日期，格式为 YYYY-MM-DD 的字符串。
   *   选定的日期改变后触发。
   */
  function Calendar(options) {
    var calendar = this;
    // 保存选项。
    options = calendar.setOptions(options).options;
    this.selectedDate = options.selectedDate || undefined;
    // 创建 DOM 基本结构。
    var $calendar = $('<div class="' + options.theme + '"><div><span class="btn prev_year" data-action="prev_year">«</span><span class="btn prev_month" data-action="prev_month">‹</span><span class="year">0000</span><span>-</span><span class="month">00</span><span class="btn next_month" data-action="next_month">›</span><span class="btn next_year" data-action="next_year">»</span></div><table><thead></thead><tbody></tbody></table></div>');
    var $controlPanel = $calendar.getFirst();
    var controls = $controlPanel.find('*');
    var $thead = $controlPanel.getNext().getFirst();
    var $tbody = $thead.getNext();
    // 创建月历头。
    var tr = $thead.insertRow(-1);
    for (var cell = 0; cell < 7; cell++) {
      tr.insertCell(-1);
    }
    // 创建月历体。
    for (var row = 0; row < 6; row++) {
      $tbody.append(tr.cloneNode(true));
    }
    // 保存 DOM 元素。
    calendar.elements = {
      calendar: $calendar,
      prevYear: controls[0],
      prevMonth: controls[1],
      year: controls[2],
      month: controls[4],
      nextMonth: controls[5],
      nextYear: controls[6],
      headCells: $thead.find('td'),
      bodyCells: $tbody.find('td')
    };
    // 绑定 DOM 事件。
    $calendar.on('mousedown', function() {
      return false;
    });
    $calendar.on('click', function(e) {
      var $target = e.target;
      if ($target.hasClass('btn') && !$target.hasClass('disabled')) {
        // 点击动作按钮。
        var action = $target.getData('action');
        var year = Number.toInteger(calendar.elements.year.innerText);
        var month = Number.toInteger(calendar.elements.month.innerText);
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
        }
        calendar.render(year + '-' + month.padZero(2));
      } else if ($target.hasClass('enabled')) {
        // 选中一个日期。
        var selectedDate = $target.title;
        var lastSelectedDate = calendar.selectedDate;
        calendar.fire('select', {selectedDate: selectedDate});
        if (selectedDate !== lastSelectedDate) {
          calendar.selectedDate = selectedDate;
          calendar.fire('change', {selectedDate: selectedDate, lastSelectedDate: lastSelectedDate});
        }
      }
      return false;
    });
  }

//--------------------------------------------------[Calendar.options]
  /**
   * 默认选项。
   * @name Calendar.options
   */
  Calendar.options = {
    firstDayOfWeek: 0,
    theme: 'calendar',
    selectedDate: undefined,
    minDate: '1900-01-01',
    maxDate: '2100-12-31'
  };

//--------------------------------------------------[Calendar.prototype.getElement]
  /**
   * 获取月历的容器元素，以便选择插入 DOM 树的位置。
   * @name Calendar.prototype.getElement
   * @function
   * @returns {Element} 月历的容器元素。
   */
  Calendar.prototype.getElement = function() {
    return this.elements.calendar;
  };

//--------------------------------------------------[Calendar.prototype.render]
  /**
   * 渲染指定的月份。
   * @name Calendar.prototype.render
   * @function
   * @param {string} [month] 月份，格式为 YYYY-MM 的字符串。
   *   若该参数没有指定，则使用当前已选定的日期所在的月份。
   * @returns {Calendar} Calendar 对象。
   */
  Calendar.prototype.render = function(month) {
    var options = this.options;
    // 获取最大、最小、要显示的年和月。
    var minDate = Date.from(options.minDate);
    var maxDate = Date.from(options.maxDate);
    var showDate = new Date(Math.limit((month ? Date.from(month, 'YYYY-MM') : (this.selectedDate ? Date.from(this.selectedDate) : new Date())).getTime(), minDate.getTime(), maxDate.getTime()));
    var minY = minDate.getFullYear();
    var maxY = maxDate.getFullYear();
    var showY = showDate.getFullYear();
    var minM = minDate.getMonth();
    var maxM = maxDate.getMonth();
    var showM = showDate.getMonth();
    // 设置控制按钮。
    this.elements.prevYear[showY === minY ? 'addClass' : 'removeClass']('disabled');
    this.elements.prevMonth[showY === minY && showM === minM ? 'addClass' : 'removeClass']('disabled');
    this.elements.nextMonth[showY === maxY && showM === maxM ? 'addClass' : 'removeClass']('disabled');
    this.elements.nextYear[showY === maxY ? 'addClass' : 'removeClass']('disabled');
    // 显示年份和月份。
    this.elements.year.innerText = showY;
    this.elements.month.innerText = (showM + 1).padZero(2);
    // 星期类名（数组下标与星期数字相等）。
    var dayNames = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
    var dayTexts = ['日', '一', '二', '三', '四', '五', '六'];
    // 每周从周几开始。
    var startDay = options.firstDayOfWeek;
    // 输出月历头。
    this.elements.headCells.forEach(function($cell, index) {
      $cell.className = dayNames[(index + startDay) % 7];
      $cell.innerText = dayTexts[(index + startDay) % 7];
    });
    // 计算本月第一天和最后一天应该在月历的第几个单元格显示。
    var y;
    var m;
    var d;
    var startIndex = (new Date(showY, showM, 1).getDay() + 7 - startDay) % 7 || 7;
    var endIndex = startIndex + new Date(showY, showM + 1, 0).getDate();
    // 今天的日期。
    var today = Date.from(new Date().format()).getTime();
    // 选定的日期。
    var selectedDate = this.selectedDate ? new Date(Math.limit(Date.from(this.selectedDate).getTime(), minDate.getTime(), maxDate.getTime())).getTime() : 0;
    // 输出月历体。
    this.elements.bodyCells.forEach(function($cell, index) {
      var date = new Date(showY, showM, index - startIndex + 1);
      y = date.getFullYear();
      m = date.getMonth();
      d = date.getDate();
      // 星期几。
      $cell.className = dayNames[date.getDay()];
      // 日期区间。
      if (index < startIndex) {
        // 上个月的日期。
        $cell.addClass('prev_month');
      } else if (index < endIndex) {
        // 这个月的日期。
      } else {
        // 下个月的日期。
        $cell.addClass('next_month');
      }
      // 今天的日期。
      if (today === date.getTime()) {
        $cell.addClass('today');
      }
      // 选定的日期。
      if (selectedDate && selectedDate === date.getTime()) {
        $cell.addClass('selected_date');
      }
      // 输出日期。
      $cell.innerText = d;
      $cell.title = date.format();
      // 是否超出范围。
      if (date < minDate || date > maxDate) {
        $cell.title += '(超出范围)';
        $cell.addClass('disabled');
      } else {
        $cell.addClass('enabled');
      }
    });
    // 渲染完毕。
    this.fire('render', {renderedMonth: showDate.format('YYYY-MM')});
    return this;
  };

//--------------------------------------------------[Calendar]
  window.Calendar = new Component(Calendar, Calendar.options, Calendar.prototype);

});
