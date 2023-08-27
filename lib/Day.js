'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _react = _interopRequireDefault(require('react'))
var _constants = require('./utils/constants')
var _propTypes = require('./utils/propTypes')
var _TimeGrid = _interopRequireDefault(require('./TimeGrid'))
var Day = function Day(props) {
  /**
   * This allows us to default min, max, and scrollToTime
   * using our localizer. This is necessary until such time
   * as TODO: TimeGrid is converted to a functional component.
   */

  // how does changing this to functional change how min, max, and scrollToTime work?
  var date = props.date,
    localizer = props.localizer,
    _props$min = props.min,
    min =
      _props$min === void 0 ? localizer.startOf(new Date(), 'day') : _props$min,
    _props$max = props.max,
    max =
      _props$max === void 0 ? localizer.endOf(new Date(), 'day') : _props$max,
    _props$scrollToTime = props.scrollToTime,
    scrollToTime =
      _props$scrollToTime === void 0
        ? localizer.startOf(new Date(), 'day')
        : _props$scrollToTime,
    _props$enableAutoScro = props.enableAutoScroll,
    enableAutoScroll =
      _props$enableAutoScro === void 0 ? true : _props$enableAutoScro
  var range = Day.range(date, {
    localizer: localizer,
  })
  return /*#__PURE__*/ _react.default.createElement(
    _TimeGrid.default,
    Object.assign({}, props, {
      range: range,
      eventOffset: 10,
      localizer: localizer,
      min: min,
      max: max,
      scrollToTime: scrollToTime,
      enableAutoScroll: enableAutoScroll,
    })
  )
}
Day.range = function (date, _ref) {
  var localizer = _ref.localizer
  return [localizer.startOf(date, 'day')]
}
Day.navigate = function (date, action, _ref2) {
  var localizer = _ref2.localizer
  switch (action) {
    case _constants.navigate.PREVIOUS:
      return localizer.add(date, -1, 'day')
    case _constants.navigate.NEXT:
      return localizer.add(date, 1, 'day')
    default:
      return date
  }
}
Day.title = function (date, _ref3) {
  var localizer = _ref3.localizer
  return localizer.format(date, 'dayHeaderFormat')
}
var _default = Day
exports.default = _default
