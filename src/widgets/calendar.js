/**
 * @fileOverview Widget - 月历。
 * @author sundongguo@gmail.com
 * @version 20121024
 */

(function() {
//==================================================[Widget - 月历]
//--------------------------------------------------[Calendar]
  /**
   * 月历。
   * @name Calendar
   * @constructor
   * @attribute data-month
   *   指定要显示哪一个月的月历，格式为 YYYY-MM。
   *   如果不指定本属性，则使用当前月份作为默认值。
   *   当需要将月历集成在其他功能中，只希望主动调用 update 方法进行更新时，应指定为 '0000-00'，这样就不会以当前月份作为默认值来自动调用 update 方法。
   * @attribute data-first-day
   *   指定每周的第一天是星期几，取值范围为 0 - 6。
   *   如果不指定本属性，则使用 0 作为默认值，即每周的第一天为星期日。
   * @fires update
   *   {string} month 显示的月份，格式为 YYYY-MM 的字符串。
   *   调用 update 方法后触发。
   * @fires cellupdate
   *   {Element} cell 已更新的单元格。
   *   {Date} date 已更新的日期。
   *   日期单元格更新后触发。每次调用 update 方法时，每个日期单元格都会更新一次。
   * @description
   *   月历可以显示指定月份的日期排列情况。
   *   <strong>启用方式：</strong>
   *   为元素添加 'widget-calendar' 类，即可使该元素成为月历。
   *   <strong>结构约定：</strong>
   *   当月历初始化时，会根据 data-month 的配置自动在其内部创建一个表格元素，来显示指定月份的日期排列（在 data-month 不为 '0000-00' 的情况下）。
   *   其中每个单元格都有用于表示星期几的类名 'sun'、'mon'、'tues'、'wed'、'thurs'、'fri'、'sat'。
   *   上一个月的日期所在的单元格会被添加类名 'prev'，下一个月的日期所在的单元格会被添加类名 'next'。
   *   今天的日期所在的单元格会被添加类名 'today'。
   *   <strong>新增行为：</strong>
   *   如果需要更改月历显示的月份，调用 update 方法即可。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .widget-calendar table { table-layout: fixed; border-collapse: separate; border-spacing: 1px; width: 218px; font: 14px/20px Verdana, Helvetica, Arial, SimSun, serif; cursor: default; }
   *   .widget-calendar table td { padding: 0; border: 1px solid silver; border-radius: 2px; text-align: center; }
   *   .widget-calendar thead td { border-color: white; color: navy; font-weight: bold; }
   *   .widget-calendar tbody td { color: black; }
   *   .widget-calendar tbody td.prev, .widget-calendar tbody td.next { color: silver; }
   *   .widget-calendar tbody td.today { font-weight: bold; text-decoration: underline; }
   *   </pre>
   */

  /**
   * 当前显示的月份。
   * @name Calendar#month
   * @type string
   */

  /**
   * 显示指定的月份。
   * @name Calendar#update
   * @function
   * @param {string} [month] 月份，格式为 YYYY-MM 的字符串。
   *   若该参数没有指定，则使用当前已显示的月份（即刷新当前的月历）。
   * @returns {Element} 本元素。
   */

  Widget.register('calendar', {
    css: [
      '.widget-calendar table { table-layout: fixed; border-collapse: separate; border-spacing: 1px; width: 218px; font: 14px/20px Verdana, Helvetica, Arial, SimSun, serif; cursor: default; }',
      '.widget-calendar table td { padding: 0; border: 1px solid silver; border-radius: 2px; text-align: center; }',
      '.widget-calendar thead td { border-color: white; color: navy; font-weight: bold; }',
      '.widget-calendar tbody td { color: black; }',
      '.widget-calendar tbody td.prev, .widget-calendar tbody td.next { color: silver; }',
      '.widget-calendar tbody td.today { font-weight: bold; text-decoration: underline; }'
    ],
    config: {
      month: '',
      firstDay: 0
    },
    methods: {
      update: function(month) {
        var $element = this;

        // 输出星期类名与文字。
        var dayNames = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
        var dayTexts = ['日', '一', '二', '三', '四', '五', '六'];

        // 要显示的月份。
        if (month) {
          $element.month = month;
        }
        var showDate = Date.from($element.month, 'YYYY-MM');
        var showY = showDate.getFullYear();
        var showM = showDate.getMonth();

        // 输出月历头和月历体。
        var firstDayOfWeek = $element.firstDay;
        var startIndex = (showDate.getDay() + 7 - firstDayOfWeek) % 7 || 7;
        var endIndex = startIndex + new Date(showY, showM + 1, 0).getDate();
        var today = Date.from(new Date().format()).getTime();
        $element.elements.theadCells.forEach(function($cell, index) {
          $cell.className = dayNames[(index + firstDayOfWeek) % 7];
          $cell.innerText = dayTexts[(index + firstDayOfWeek) % 7];
        });
        $element.elements.tbodyCells.forEach(function($cell, index) {
          var date = new Date(showY, showM, index - startIndex + 1);
          // 星期几。
          $cell.className = dayNames[date.getDay()];
          // 日期区间。
          if (index < startIndex) {
            // 上个月的日期。
            $cell.addClass('prev');
          } else if (index < endIndex) {
            // 这个月的日期。
          } else {
            // 下个月的日期。
            $cell.addClass('next');
          }
          // 今天的日期。
          if (today === date.getTime()) {
            $cell.addClass('today');
          }
          // 输出日期。
          $cell.innerText = date.getDate();
          // 触发事件。
          $element.fire('cellupdate', {cell: $cell, date: date});
        });

        // 触发事件。
        $element.fire('update', {month: $element.month});

        return $element;

      }
    },
    events: ['update', 'cellupdate'],
    initialize: function() {
      var $element = this;

      // 添加新元素。
      var $table = document.$('<table><thead></thead><tbody></tbody></table>').insertTo($element);
      var $thead = $table.getFirstChild();
      var $tbody = $table.getLastChild();
      var tr = $thead.insertRow(-1);
      for (var cell = 0; cell < 7; cell++) {
        tr.insertCell(-1);
      }
      for (var row = 0; row < 6; row++) {
        $tbody.appendChild(tr.cloneNode(true));
      }

      // 保存属性。
      $element.elements = {
        thead: $thead,
        tbody: $tbody,
        theadCells: $thead.find('td'),
        tbodyCells: $tbody.find('td')
      };
      if (!$element.month) {
        $element.month = new Date().format('YYYY-MM');
      }

      // 如果 month 不为 '0000-00' 则自动显示指定月份的月历。
      if ($element.month !== '0000-00') {
        $element.update();
      }

    }
  });

})();
