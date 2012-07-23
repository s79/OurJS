/**
 * @fileOverview 组件 - 表单验证。
 * @author sundongguo@gmail.com
 * @version 20120723
 */
execute(function($) {
//==================================================[Validator]
  /*
   * 表单验证。
   */

//--------------------------------------------------[Validator Constructor]
  /**
   * 表单验证。
   * @name Validator
   * @constructor
   * @param {Element} element 要验证的表单元素。
   * @param {Object} rules 验证规则，格式为 {fieldName: rule, ...}。
   *   其中 fieldName 为要验证的表单域的名称，即表单内对应的 INPUT/SELECT/TEXTAREA 元素的 name 属性值。
   *   rule 是一个对象，其<strong>可选的</strong>各个属性的要求和含义如下：
   *   {string} triggerEvent 触发本表单域的验证行为的事件名。
   *   {boolean} required 是否必填（必选）。
   *   {string} equals 指定该表单域的值应与哪个表单域的值一致，应指定一个本表单内的表单域的名称。
   *   {number} minLength 限定最大长度。
   *   {number} maxLength 限定最小长度。
   *   {number} minItem 限定最少选择项（仅应在该表单域存在多个元素时使用）。
   *   {number} maxItem 限定最多选择项（仅应在该表单域存在多个元素时使用）。
   *   {Function} handler 用来对该表单域的值进行验证的函数，该函数被调用时 this 的值为对应的表单域元素或包含所有对应元素的数组。
   *   {Object} serverSide 包含两个属性：url 和 options，详细内容请参考 Request 组件。服务端应返回 'true' 或 'false'，如果条件不允许，请考虑使用 options.responseParser 对服务端响应数据进行处理。
   *   {Function} onFocus 当该表单域对应的元素获得焦点时执行的回调。该函数被调用时传入该表单域的名称，其 this 值为该表单域。
   *   {Function} onSuccess 该表单域验证成功后的回调。该函数被调用时传入该表单域的名称，其 this 值为该表单域。
   *   {Function} onFailure 该表单域验证失败后的回调。该函数被调用时传入该表单域的名称，其 this 值为该表单域。
   *   实际进行验证的步骤与上述各验证规则（除三个回调除外的其余属性）的出现顺序是一致的，即先进行本地验证，最后进行服务端验证（如果有）。
   * @param {Object} [options] 可选参数。
   * @param {string} options.triggerEvent 触发每个表单域的验证行为的事件名，默认为 'change'。
   *   如果为 undefined，则在表单提交之前不会对这些表单域进行验证。
   *   可以在每一个具体的验证规则中覆盖本选项。
   * @description
   *   在要验证的表单被提交时会自动对所有已配置的规则进行验证。
   * @fires validate
   *   {Array} fields 包含本次要验证的表单域的数组。
   *   调用 validate 方法时触发。用于处理可能存在的验证前的一些收尾操作。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的验证规则均通过时为 true，否则为 false。
   *   验证结束时触发。如果存在服务端验证，则不会和 validate 事件同步触发。
   * @requires Request
   */
  var Validator = new Component(function(element, rules) {
    var validator = this;

    // 获取选项。
    var options = validator.options;

    // 保存属性。
    validator.element = $(element).on('submit', function() {
//      return validator.validate();
      validator.validate();
      return false;
    });
    validator.rules = rules;
    validator.fields = {};
    Object.forEach(rules, function(rule, fieldName) {
      var field = validator.element.elements[fieldName];
      // 将 NodeList 转换为 Array 备用。
      validator.fields[fieldName] = field.nodeType ? field : Array.from(field);
    });

  });

//--------------------------------------------------[Validator.options]
  /**
   * 默认选项。
   * @name Validator.options
   */
  Validator.options = {
    triggerEvent: 'change'
  };

//--------------------------------------------------[Validator.prototype.validate]
  // 获取一个表单域的值。当这个表单域是一个多选下拉菜单，或者包含多个元素时，返回值（数组）的长度可能大于 1。
  var getValues = function(field) {
    var values = [];
    if (field.nodeType) {
      switch (field.type) {
        case 'select-one':
        case 'select-multiple':
          Array.from(field.options).forEach(function($option) {
            if ($option.selected) {
              values.push($option.value);
            }
          });
          break;
        case 'radio':
        case 'checkbox':
          if (field.checked) {
            values.push(field.value);
          }
          break;
        default:
          if (field.value) {
            values.push(field.value);
          }
          break;
      }
    } else {
      field.forEach(function(field) {
        values = values.concat(getValues(field));
      });
    }
    return values;
  };

  /**
   * 对配置的所有规则进行验证。
   * @name Validator.prototype.validate
   * @function
   * @param {string} [fieldName] 要验证的表单域的名称，若省略则验证所有已配置规则的表单域。
   * @returns {boolean} 验证结果，true 为验证通过，false 为验证失败。
   */
  Validator.prototype.validate = function(fieldName) {
    var validator = this;
    var result = true;

    if (fieldName) {
      var field = validator.fields[fieldName];
      var rule = validator.rules[fieldName];
      // 获得值。
      var value = getValues(field);
      console.warn(fieldName, value);
    } else {
      Object.forEach(validator.rules, function(rule, fieldName) {
        result = result && validator.validate(fieldName);
      });
    }

    return result;
  };

//--------------------------------------------------[Validator]
  window.Validator = Validator;

});
