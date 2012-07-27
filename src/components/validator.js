/**
 * @fileOverview 组件 - 表单验证。
 * @author sundongguo@gmail.com
 * @version 20120723
 */
execute(function($) {
//==================================================[Validator]
  /*
   * 表单验证。
   *
   * 说明：
   *   每个表单域包含的控件都会在发生 change 事件时验证其所属域。
   *   调用 validator.validate 方法时，会对所有尚未验证的域进行验证。
   */

  // 验证值是否符合规则。
  var validate = function(validator, name) {
    var status = validator.status;
    status[name] = undefined;
    var result = true;
    var $form = validator.element;
    var rules = validator.validationRules[name];
    var value = $form.getFieldValue(name);
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
    var serverSideVerify = rules.serverSideVerify;
    if (result && serverSideVerify) {
      if (rules.lastRequest) {
        rules.lastRequest.off('finish').abort();
      }
      rules.lastRequest = new Request(serverSideVerify.url, serverSideVerify.options)
          .on('start', function() {
            validator.fire('fieldvalidating', {name: name, value: value});
          })
          .on('finish', function(e) {
            delete rules.lastRequest;
            validator.fire('fieldvalidated', {name: name, value: value, result: status[name] = e.result});
          })
          .send(value);
    } else {
      validator.fire('fieldvalidated', {name: name, value: value, result: status[name] = result});
    }
  };

//--------------------------------------------------[Validator Constructor]
  /**
   * 表单验证。
   * @name Validator
   * @constructor
   * @param {Element} element 要验证的表单元素。
   * @param {Object} validationRules 要验证的表单域及规则，格式为 {name: rules, ...}。
   *   name 为要验证的表单域的名称，即本表单元素内对应的 INPUT/SELECT/TEXTAREA 元素的 name 属性值。
   *   rules 是一个对象，其<strong>可选的</strong>各个属性的要求和含义如下：
   *   {boolean} required 必填或必选项应设置为 true，否则应设置为 false 或省略。
   *   {string} equals 指定相关表单域的名称，限制该表单域的值与相关表单域的值一致，仅应在这两个表单域均只包含一个文本控件时指定，不能指定本表单域的名字。省略为不限制。
   *   {number} minLength 当该表单域只包含一个文本控件时，限定输入文本的最小长度，否则限定选择项的最少数目。省略为不限制。
   *   {number} maxLength 当该表单域只包含一个文本控件时，限定输入文本的最大长度，否则限定选择项的最多数目。省略为不限制。
   *   {Function} handler 用来对该表单域的值进行验证的函数，该函数被调用时传入该表单域的值，其 this 的值为本表单元素。省略为不限制。
   *   {Object} serverSideVerify 包含两个属性：url 和 options，详细内容请参考 Request 组件。服务端应返回 'true' 或 'false'，如果条件不允许，应使用 options.responseParser 对服务端的响应数据进行处理。
   *   进行验证的步骤为 required - equals - min/maxLength - handler - serverSideVerify。
   * @fires fieldvalidating
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   当一个表单域开始服务端异步验证时触发。
   * @fires fieldvalidated
   *   {string} name 本次验证的表单域的名称。
   *   {string|Array} value 本次验证的表单域的值。
   *   {boolean} result 验证结果。
   *   验证每个要验证的表单域结束后触发。
   * @fires validate
   *   调用 validate 方法时触发。
   * @fires validating
   *   调用 validate 方法后，某个表单域开始服务端异步验证时触发。即便有多个表单域都开始服务端异步验证，也仅会触发一次。
   * @fires validated
   *   {boolean} result 验证结果，仅当所有已配置的规则均验证通过时为 true，否则为 false。
   *   对所有已配置的规则验证结束后触发。
   * @requires Request
   */
  var Validator = new Component(function(element, validationRules) {
    var validator = this;

    // 保存属性。
    var $form = validator.element = $(element);
    validator.validationRules = validationRules;
    // 各表单域的验证状态，true 为通过，false 为未通过，undefined 为正在验证中。
    validator.status = {};
    validator.isValidating = false;
    validator.validatingFields = {};

    validator.on('fieldvalidating.validation', function(e) {
      validator.validatingFields[e.name] = true;
    });
    validator.on('fieldvalidated.validation', function(e) {
      if (validator.validatingFields[e.name]) {
        delete validator.validatingFields[e.name];
      }
    });

    // 为控件绑定事件。
    Object.forEach(validationRules, function(rules, name) {
      Array.from($form.elements[name]).forEach(function(control) {
        var $control = $(control);
        $control.on('change.validation', function() {
          validate(validator, name);
        });
        // 如果设置了 equals 规则且已输入值，则在目标控件的值改变时重新检测本控件的值。
        var relatedName = rules.equals;
        if (relatedName) {
          $($form.elements[relatedName]).on('change.validation', function() {
            if ($control.value) {
              $control.fire('change');
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
    if (!validator.isValidating) {
      validator.isValidating = true;
      validator.fire('validate');

      var validatingFields = {};
      validator.on('fieldvalidating.validation', function(e) {
        validator.isValidating = true;
      });
      validator.on('fieldvalidated.validation', function(e) {
        //      validator.validatingFieldCount++;
      });

      Object.forEach(validator.validationRules, function(rules, name) {
        if (validator.status.hasOwnProperty(name)) {
        } else {
          validate(validator, name);
          console.warn(name);
        }
      });
    }
    return validator;
  };

//--------------------------------------------------[Validator]
  window.Validator = Validator;

});
