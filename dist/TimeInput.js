'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var isTwelveHourTime = require('./lib/is-twelve-hour-time');
var replaceCharAt = require('./lib/replace-char-at');
var getGroupId = require('./lib/get-group-id');
var getGroups = require('./lib/get-groups');
var adder = require('./lib/time-string-adder');
var caret = require('./lib/caret');
var validate = require('./lib/validate');


var Component = React.Component;

var TimeInput = function (_Component) {
    _inherits(TimeInput, _Component);

    function TimeInput(props) {
        _classCallCheck(this, TimeInput);

        var _this = _possibleConstructorReturn(this, (TimeInput.__proto__ || Object.getPrototypeOf(TimeInput)).call(this, props));

        _this.handleBlur = function () {
            if (_this.mounted) _this.setState({ caretIndex: null });
        };

        _this.handleEscape = function () {
            if (_this.mounted) _this.input.blur();
        };

        _this.handleTab = function (event) {
            var start = caret.start(_this.input);
            var value = _this.props.value;
            var groups = getGroups(value);
            var groupId = getGroupId(start);
            if (event.shiftKey) {
                if (!groupId) return;
                groupId--;
            } else {
                if (groupId >= groups.length - 1) return;
                groupId++;
            }
            event.preventDefault();
            var index = groupId * 3;
            if (_this.props.value.charAt(index) === ' ') index++;
            if (_this.mounted) _this.setState({ caretIndex: index });
        };

        _this.handleArrows = function (event) {
            event.preventDefault();
            var start = caret.start(_this.input);
            var value = _this.props.value;
            var amount = event.which === 38 ? 1 : -1;
            if (event.shiftKey) {
                amount *= 2;
                if (event.metaKey) amount *= 2;
            }
            value = adder(value, getGroupId(start), amount);
            _this.onChange(value, start);
        };

        _this.handleBackspace = function (event) {
            event.preventDefault();
            var defaultValue = _this.props.defaultValue;
            var start = caret.start(_this.input);
            var value = _this.props.value;
            var end = caret.end(_this.input);
            var diff = end - start;
            if (!diff) {
                if (value[start - 1] === ':') start--;
                value = replaceCharAt(value, start - 1, defaultValue.charAt(start - 1));
                start--;
            } else {
                while (diff--) {
                    if (value[end - 1] !== ':') {
                        value = replaceCharAt(value, end - 1, defaultValue.charAt(end - 1));
                    }
                    end--;
                }
            }
            _this.onChange(value, start);
        };

        _this.handleForwardspace = function (event) {
            event.preventDefault();
            var defaultValue = _this.props.defaultValue;
            var start = caret.start(_this.input);
            var value = _this.props.value;
            var end = caret.end(_this.input);
            var diff = end - start;
            if (!diff) {
                if (value[start] === ':') start++;
                value = replaceCharAt(value, start, defaultValue.charAt(start));
                start++;
            } else {
                while (diff--) {
                    if (value[end - 1] !== ':') {
                        value = replaceCharAt(value, start, defaultValue.charAt(start));
                    }
                    start++;
                }
            }
            _this.onChange(value, start);
        };

        _this.handleKeyDown = function (event) {
            if (event.which === 9) return _this.handleTab(event);
            if (event.which === 38 || event.which === 40) return _this.handleArrows(event);
            if (event.which === 8) return _this.handleBackspace(event);
            if (event.which === 46) return _this.handleForwardspace(event);
            if (event.which === 27) return _this.handleEscape(event);
        };

        _this.handleChange = function (event) {
            var value = _this.props.value;
            var newValue = _this.input.value;
            newValue += value.substr(newValue.length, value.length);
            var diff = newValue.length - value.length;
            var end = caret.start(_this.input);
            var insertion = void 0;
            event.preventDefault();
            if (diff > 0) {
                var start = end - diff;
                insertion = newValue.slice(end - diff, end);
                while (diff--) {
                    var oldChar = value.charAt(start);
                    var newChar = insertion.charAt(0);
                    if (_this.isSeparator(oldChar)) {
                        if (_this.isSeparator(newChar)) {
                            insertion = insertion.slice(1);
                            start++;
                        } else {
                            start++;
                            diff++;
                            end++;
                        }
                    } else {
                        value = replaceCharAt(value, start, newChar);
                        insertion = insertion.slice(1);
                        start++;
                    }
                }
                newValue = value;
            }
            if (validate(newValue)) {
                _this.onChange(newValue, end);
            } else {
                var caretIndex = _this.props.value.length - (newValue.length - end);
                if (_this.mounted) _this.setState({ caretIndex: caretIndex });
            }
        };

        _this.onChange = function (str, caretIndex) {
            if (_this.props.onChange) _this.props.onChange(_this.format(str));
            if (_this.mounted && typeof caretIndex === 'number') _this.setState({ caretIndex: caretIndex });
        };

        _this.state = {};
        return _this;
    }

    _createClass(TimeInput, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var className = 'TimeInput';
            if (this.props.className) {
                className += ' ' + this.props.className;
            }
            return React.createElement(
                'div',
                { className: className },
                React.createElement('input', {
                    className: 'TimeInput-input',
                    ref: function ref(input) {
                        _this2.input = input;
                    },
                    type: 'text',
                    value: this.format(this.props.value),
                    onChange: this.handleChange,
                    onBlur: this.handleBlur,
                    onKeyDown: this.handleKeyDown
                })
            );
        }
    }, {
        key: 'format',
        value: function format(val) {
            if (isTwelveHourTime(val)) val = val.replace(/^00/, '12');
            return val.toUpperCase();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.mounted = true;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.mounted = false;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var index = this.state.caretIndex;
            if (index || index === 0) caret.set(this.input, index);
        }
    }, {
        key: 'isSeparator',
        value: function isSeparator(char) {
            return (/[:\s]/.test(char)
            );
        }
    }]);

    return TimeInput;
}(Component);

TimeInput.defaultProps = {
    value: '12:00 AM',
    defaultValue: '00:00:00:000 AM'
};

TimeInput.propTypes = {
    className: _propTypes2.default.string,
    value: _propTypes2.default.string,
    onChange: _propTypes2.default.func,
    defaultValue: _propTypes2.default.string
};

module.exports = TimeInput;