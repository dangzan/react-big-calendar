'use strict'

var _interopRequireWildcard =
  require('@babel/runtime/helpers/interopRequireWildcard').default
var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _slicedToArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/slicedToArray')
)
var _react = _interopRequireWildcard(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _helpers = require('./utils/helpers')
var _selection = require('./utils/selection')
var _Selection = _interopRequireWildcard(require('./Selection'))
var BackgroundCells = function BackgroundCells(props) {
  var range = props.range,
    getNow = props.getNow,
    getters = props.getters,
    currentDate = props.date,
    Wrapper = props.components.dateCellWrapper,
    localizer = props.localizer
  var _useState = (0, _react.useState)(false),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    selecting = _useState2[0],
    setSelecting = _useState2[1]
  var containerRef = (0, _react.useRef)(null)
  var selector = (0, _react.useRef)(null)
  var _initial = (0, _react.useRef)({
    x: 0,
    y: 0,
  })
  var startIdx = (0, _react.useRef)(-1)
  var endIdx = (0, _react.useRef)(-1)
  ;(0, _react.useEffect)(
    function () {
      if (props.selectable) {
        _selectable()
      }
      return function () {
        _teardownSelectable()
      }
    },
    [props.selectable]
  )
  var _selectable = function _selectable() {
    var node = containerRef.current
    selector.current = new _Selection.default(props.container, {
      longPressThreshold: props.longPressThreshold,
    })
    var selectorClicksHandler = function selectorClicksHandler(
      point,
      actionType
    ) {
      if (
        !(0, _Selection.isEvent)(node, point) &&
        !(0, _Selection.isShowMore)(node, point)
      ) {
        var rowBox = (0, _Selection.getBoundsForNode)(node)
        var _range = props.range,
          rtl = props.rtl
        if ((0, _selection.pointInBox)(rowBox, point)) {
          var currentCell = (0, _selection.getSlotAtX)(
            rowBox,
            point.x,
            rtl,
            _range.length
          )
          _selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point,
          })
        }
      }
      _initial.current = {}
      setSelecting(false)
    }
    selector.current.on('selecting', function (box) {
      var range = props.range,
        rtl = props.rtl
      if (!selecting) {
        ;(0, _helpers.notify)(props.onSelectStart, [box])
        _initial.current = {
          x: box.x,
          y: box.y,
        }
      }
      if (selector.current.isSelected(node)) {
        var nodeBox = (0, _Selection.getBoundsForNode)(node)
        var _dateCellSelection = (0, _selection.dateCellSelection)(
          _initial.current,
          nodeBox,
          box,
          range.length,
          rtl
        )
        startIdx.current = _dateCellSelection.startIdx
        endIdx.current = _dateCellSelection.endIdx
      }
      setSelecting(true)
    })
    selector.current.on('beforeSelect', function (box) {
      if (props.selectable !== 'ignoreEvents')
        return !(0, _Selection.isEvent)(containerRef.current, box)
      return false
    })
    selector.current.on('click', function (point) {
      return selectorClicksHandler(point, 'click')
    })
    selector.current.on('doubleClick', function (point) {
      return selectorClicksHandler(point, 'doubleClick')
    })
    selector.current.on('select', function (bounds) {
      _selectSlot({
        startIdx: startIdx.current,
        endIdx: endIdx.current,
        action: 'select',
        bounds: bounds,
      })
      _initial.current = {}
      setSelecting(false)
      ;(0, _helpers.notify)(props.onSelectEnd, [
        {
          startIdx: startIdx.current,
          endIdx: endIdx.current,
        },
      ])
    })
  }
  var _teardownSelectable = function _teardownSelectable() {
    if (selector.current) {
      selector.current.teardown()
      selector.current = null
    }
  }
  var _selectSlot = function _selectSlot(_ref) {
    var endIdx = _ref.endIdx,
      startIdx = _ref.startIdx,
      action = _ref.action,
      bounds = _ref.bounds,
      box = _ref.box
    if (endIdx !== -1 && startIdx !== -1) {
      props.onSelectSlot &&
        props.onSelectSlot({
          start: startIdx,
          end: endIdx,
          action: action,
          bounds: bounds,
          box: box,
          resourceId: props.resourceId,
        })
    }
  }
  var current = getNow()
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: (0, _clsx.default)(props.className, 'rbc-row-bg'),
      ref: containerRef,
    },
    range.map(function (date, index) {
      var selected =
        selecting && index >= startIdx.current && index <= endIdx.current
      var _getters$dayProp = getters.dayProp(date),
        className = _getters$dayProp.className,
        style = _getters$dayProp.style
      return /*#__PURE__*/ _react.default.createElement(
        Wrapper,
        {
          key: index,
          value: date,
          range: range,
        },
        /*#__PURE__*/ _react.default.createElement('div', {
          style: style,
          className: (0, _clsx.default)(
            'rbc-day-bg',
            className,
            selected && 'rbc-selected-cell',
            localizer.isSameDate(date, current) && 'rbc-today',
            currentDate &&
              localizer.neq(currentDate, date, 'month') &&
              'rbc-off-range-bg'
          ),
        })
      )
    })
  )
}
var _default = BackgroundCells
exports.default = _default
