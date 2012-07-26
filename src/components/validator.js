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

  // 验证值是否符合规则。
  var validate = function(validator, name, value) {
    var result = true;
    var $form = validator.element;
    var rules = validator.validationRules[name];
    var serverSideVerify = rules.serverSideVerify;
    validator.fire('fieldvalidationstart', {name: name, value: value});
    if (rules.required) {
      result = value.length > 0;
    }
    if (result && rules.equals) {
      result = value === $form.getFieldValue(rules.equals);
    }
    if (result && Number.isInteger(rules.minLength)) {
      result = value.length >= rules.minLength;
    }
    if (result && Number.isInteger(rules.maxLength)) {
      result = value.length <= rules.maxLength;
    }
    if (result && rules.handler) {
      result = rules.handler.call($form, value);
    }
    if (result && serverSideVerify) {
      if (rules.lastRequest) {
        rules.lastRequest.off('finish').abort();
      }
      rules.lastRequest = new Request(serverSideVerify.url, serverSideVerify.options)
          .on('finish', function(e) {
            delete rules.lastRequest;
            validator.fire('fieldvalidationfinish', {name: name, value: value, result: e.result});
          })
          .send(value);
    } else {
      validator.fire('fieldvalidationfinish', {name: name, value: value, result: result});
    }
  };

//--------------------------------------------------[Validator Constructor]
  /**
   * 表单验证。
   * @name Validator
   * @constructor
   * @param {Element} element 要验证的表单元素。
   * @param {Object} validationRules 要验证的表单域及规则，格式为 {name: rules, ...}。
   *   其中 name 为要验证的表单域的名称，即本表单元素内对应的 INPUT/SELECT/TEXTAREA 元素的 name 属性值。
   *   rules 是一个对象，其<strong>可选的</strong>各个属性的要求和含义如下：
   *   {string} triggerEventType 触发该表单域的验证行为的事件名，如省略则使用 change 事件。
   *   {boolean} required 必填或必选项应设置为 true，否则应设置为 false 或省略。
   *   {string} equals 指定相关表单域的名称，限制该表单域的值与相关表单域的值一致，仅应在这两个表单域均只包含一个文本控件时指定，不能指定本表单域的名字。省略为不限制。
   *   {number} minLength 当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。省略为不限制。
   *   {number} maxLength 当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。省略为不限制。
   *   {Function} handler 用来对该表单域的值进行验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素。省略为不限制。
   *   {Object} serverSideVerify 包含两个属性：url 和 options，详细内容请参考 Request 组件。服务端应返回 'true' 或 'false'，如果条件不允许，应使用 options.responseParser 对服务端的响应数据进行处理。
   *   进行验证的步骤为 required - equals - min/maxLength - handler - serverSideVerify。
   * @fires fieldvalidationstart
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   验证每个要验证的表单域开始时触发。
   * @fires fieldvalidationfinish
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   {boolean} result 验证结果。
   *   验证每个要验证的表单域结束后触发。
   * @fires validate
   *   调用 validate 方法时触发。用于处理可能存在的验证前的一些收尾操作。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   对所有已配置的规则验证结束后触发。如果存在服务端验证，则不会和 validate 事件同步触发。
   * @requires Request
   */
  var Validator = new Component(function(element, validationRules) {
    var validator = this;
    var $form = $(element);

    // 保存属性。
    validator.element = $form;
    validator.validationRules = validationRules;
    validator.fieldValues = {};
    validator.validating = true;  // TODO
    var test;

    // 保存已通过验证的值。
    validator
        .on('fieldvalidationstart', function(e) {
          delete this.fieldValues[e.name];
        })
        .on('fieldvalidationfinish', function(e) {
          if (e.result) {
            this.fieldValues[e.name] = e.value;
          } else {
            if (!test) {
//              test = 1;
              Array.from($form.elements[e.name]).getFirst().focus();
            }
          }
        });

    // 绑定事件。
    Object.forEach(validationRules, function(rules, name) {
      Array.from($form.elements[name]).forEach(function(control) {
        var $control = $(control);
        var triggerEventType = rules.triggerEventType || 'change';
        var triggerEventName = triggerEventType + '.validation';
        $control.on(triggerEventName, function() {
          var value = $form.getFieldValue(name);
          validator.fieldValues[name] = value;
          validate(validator, name, value);
        });
        // 如果设置了 equals 规则且已输入值，则在目标控件上发生本控件指定的触发事件时重新检测本控件的值。
        var relatedName = rules.equals;
        if (relatedName) {
          $($form.elements[relatedName]).on(triggerEventName, function() {
            if ($control.value) {
              $control.fire(triggerEventType);
            }
          });
        }
      });
    });

  });

//--------------------------------------------------[Validator.prototype.validate]
  /**
   * 对配置的所有规则进行验证。
   * @name Validator.prototype.validate
   * @function
   * @returns {Object} Validator 对象。
   */
  Validator.prototype.validate = function() {
    var validator = this;
    var $form = validator.element;
    var validationRules = validator.validationRules;
    var fieldValues = validator.fieldValues;

//    var counter = 0;
//    var allValidationIsPassed = true;
    Object.forEach(validationRules, function(rules, name) {
//      ++counter;
      var value = $form.getFieldValue(name);
      if (rules.equals || value !== fieldValues[name]) {
        validate(validator, name, value);
      }
    });

    return validator;
  };

//--------------------------------------------------[Validator]
  window.Validator = Validator;

});
