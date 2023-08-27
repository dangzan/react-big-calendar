'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
var _interopRequireWildcard =
  require('@babel/runtime/helpers/interopRequireWildcard').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _objectSpread2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectSpread2')
)
var _slicedToArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/slicedToArray')
)
var _objectWithoutProperties2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutProperties')
)
var _objectDestructuringEmpty2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectDestructuringEmpty')
)
var _react = _interopRequireWildcard(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _Selection = _interopRequireWildcard(require('./Selection'))
var TimeSlotUtils = _interopRequireWildcard(require('./utils/TimeSlots'))
var _selection = require('./utils/selection')
var _helpers = require('./utils/helpers')
var DayEventLayout = _interopRequireWildcard(require('./utils/DayEventLayout'))
var _TimeSlotGroup = _interopRequireDefault(require('./TimeSlotGroup'))
var _TimeGridEvent = _interopRequireDefault(require('./TimeGridEvent'))
var _propTypes = require('./utils/propTypes')
var _DayColumnWrapper = _interopRequireDefault(require('./DayColumnWrapper'))
var _excluded = ['eventContainerWrapper'],
  _excluded2 = ['dayProp']
// isNow is true if the DayColumn's date is today
var DayColumn = function DayColumn(_ref) {
  var props = Object.assign(
    {},
    ((0, _objectDestructuringEmpty2.default)(_ref), _ref)
  )
  var accessors = props.accessors,
    _props$components = props.components,
    EventContainer = _props$components.eventContainerWrapper,
    components = (0, _objectWithoutProperties2.default)(
      _props$components,
      _excluded
    ),
    date = props.date,
    dayLayoutAlgorithm = props.dayLayoutAlgorithm,
    getNow = props.getNow,
    _props$getters = props.getters,
    dayProp = _props$getters.dayProp,
    getters = (0, _objectWithoutProperties2.default)(
      _props$getters,
      _excluded2
    ),
    isNow = props.isNow,
    localizer = props.localizer,
    longPressThreshold = props.longPressThreshold,
    max = props.max,
    min = props.min,
    onDoubleClickEvent = props.onDoubleClickEvent,
    onKeyPressEvent = props.onKeyPressEvent,
    onSelectEvent = props.onSelectEvent,
    onSelecting = props.onSelecting,
    onSelectSlot = props.onSelectSlot,
    resizable = props.resizable,
    resource = props.resource,
    rtl = props.rtl,
    selected = props.selected,
    selectable = props.selectable,
    step = props.step,
    timeslots = props.timeslots
  var _useState = (0, _react.useState)(null),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    timeIndicatorPosition = _useState2[0],
    setTimeIndicatorPosition = _useState2[1]
  var _useState3 = (0, _react.useState)(null),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    timeIndicatorTimeoutId = _useState4[0],
    setTimeIndicatorTimeoutId = _useState4[1]
  var _useState5 = (0, _react.useState)(false),
    _useState6 = (0, _slicedToArray2.default)(_useState5, 2),
    intervalTriggered = _useState6[0],
    setIntervalTriggered = _useState6[1]
  var _useState7 = (0, _react.useState)(null),
    _useState8 = (0, _slicedToArray2.default)(_useState7, 2),
    selector = _useState8[0],
    setSelector = _useState8[1]
  var _useState9 = (0, _react.useState)({
      selecting: false,
      top: '',
      height: '',
      start: null,
      startDate: Date,
      end: null,
      endDate: Date,
    }),
    _useState10 = (0, _slicedToArray2.default)(_useState9, 2),
    selectionState = _useState10[0],
    setSelectionState = _useState10[1]
  var prevPropsRef = (0, _react.useRef)(null)
  var prevTimeIndicatorPositionRef = (0, _react.useRef)(null)
  var containerRef = (0, _react.useRef)(null)
  var slotMetrics = TimeSlotUtils.getSlotMetrics(props)

  // storing timeIndicatorPosition for comparison later
  ;(0, _react.useEffect)(
    function () {
      prevTimeIndicatorPositionRef.current = timeIndicatorPosition
    },
    [timeIndicatorPosition]
  )

  // storing previous props to do comparison later with current props
  ;(0, _react.useEffect)(
    function () {
      prevPropsRef.current = props
    },
    [isNow, getNow, localizer, date]
  )

  // refactor of UNSAFE_componentWillReceiveProps
  ;(0, _react.useEffect)(
    function () {
      if (selectable && !prevPropsRef.current.selectable) _selectable()
      if (!selectable && prevPropsRef.current.selectable) teardownSelectable()
      if (timeIndicatorTimeoutId) {
        clearTimeIndicatorInterval(timeIndicatorTimeoutId)
      }
      slotMetrics = slotMetrics.update(props)
    },
    [props]
  )

  // refactor of componentDidMount
  ;(0, _react.useEffect)(function () {
    selectable && _selectable()
    if (isNow) {
      setTimeIndicatorPositionUpdateInterval()
    }
    return function () {
      teardownSelectable()
      if (timeIndicatorTimeoutId) {
        clearTimeIndicatorInterval(timeIndicatorTimeoutId)
      }
    }
  }, [])

  // refactor of componentDidUpdate
  ;(0, _react.useEffect)(
    function () {
      var getNowChanged = localizer.neq(
        prevPropsRef.current.getNow(),
        getNow(),
        'minutes'
      )
      if (prevPropsRef.current.isNow !== isNow || getNowChanged) {
        clearTimeIndicatorInterval()
        if (isNow) {
          var tail =
            !getNowChanged &&
            localizer.eq(prevPropsRef.current.date, date, 'minutes') &&
            prevTimeIndicatorPositionRef.current === timeIndicatorPosition
          setTimeIndicatorPositionUpdateInterval(tail)
        }
      } else if (
        isNow &&
        (localizer.neq(prevPropsRef.current.min, min, 'minutes') ||
          localizer.neq(prevPropsRef.current.max, max, 'minutes'))
      ) {
        positionTimeIndicator()
      }
    },
    [isNow, getNow, localizer, date, min, max]
  )

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  function setTimeIndicatorPositionUpdateInterval() {
    var tail =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false
    if (!intervalTriggered && !tail) {
      positionTimeIndicator()
    }
    var timeIndicatorTimeout = setTimeout(function () {
      setIntervalTriggered(true)
      positionTimeIndicator()
      setTimeIndicatorPositionUpdateInterval()
    }, 60000)
    setTimeIndicatorTimeoutId(timeIndicatorTimeout)
  }
  function clearTimeIndicatorInterval() {
    setIntervalTriggered(false)
    clearTimeout(timeIndicatorTimeoutId)
    setTimeIndicatorTimeoutId(null)
  }
  function positionTimeIndicator() {
    var current = getNow()
    if (current >= min && current <= max) {
      var top = slotMetrics.getCurrentTimePosition(current)
      setIntervalTriggered(true)
      setTimeIndicatorPosition(top)
    } else {
      clearTimeIndicatorInterval()
    }
  }
  var selectDates = {
    start: selectionState.startDate,
    end: selectionState.endDate,
  }
  var _dayProp = dayProp(max),
    className = _dayProp.className,
    style = _dayProp.style
  var DayColumnWrapperComponent =
    components.dayColumnWrapper || _DayColumnWrapper.default
  return /*#__PURE__*/ _react.default.createElement(
    DayColumnWrapperComponent,
    {
      ref: containerRef,
      date: date,
      style: style,
      className: (0, _clsx.default)(
        className,
        'rbc-day-slot',
        'rbc-time-column',
        isNow && 'rbc-now',
        isNow && 'rbc-today',
        // WHY
        selectionState.selecting && 'rbc-slot-selecting'
      ),
      slotMetrics: slotMetrics,
    },
    slotMetrics.groups.map(function (grp, idx) {
      return /*#__PURE__*/ _react.default.createElement(
        _TimeSlotGroup.default,
        {
          key: idx,
          group: grp,
          resource: resource,
          getters: getters,
          components: components,
        }
      )
    }),
    /*#__PURE__*/ _react.default.createElement(
      EventContainer,
      {
        localizer: localizer,
        resource: resource,
        accessors: accessors,
        getters: getters,
        components: components,
        slotMetrics: slotMetrics,
      },
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: (0, _clsx.default)('rbc-events-container', rtl && 'rtl'),
        },
        renderEvents({
          events: props.backgroundEvents,
          isBackgroundEvent: true,
        }),
        renderEvents({
          events: props.events,
        })
      )
    ),
    selectionState.selecting &&
      /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          className: 'rbc-slot-selection',
          style: {
            top: selectionState.top,
            height: selectionState.height,
          },
        },
        /*#__PURE__*/ _react.default.createElement(
          'span',
          null,
          localizer.format(selectDates, 'selectRangeFormat')
        )
      ),
    isNow &&
      intervalTriggered &&
      /*#__PURE__*/ _react.default.createElement('div', {
        className: 'rbc-current-time-indicator',
        style: {
          top: ''.concat(timeIndicatorPosition, '%'),
        },
      })
  )
  function renderEvents(_ref2) {
    var events = _ref2.events,
      isBackgroundEvent = _ref2.isBackgroundEvent
    var messages = localizer.messages
    var styledEvents = DayEventLayout.getStyledEvents({
      events: events,
      accessors: accessors,
      slotMetrics: slotMetrics,
      minimumStartDifference: Math.ceil((step * timeslots) / 2),
      dayLayoutAlgorithm: dayLayoutAlgorithm,
    })
    return styledEvents.map(function (_ref3, idx) {
      var event = _ref3.event,
        style = _ref3.style
      var end = accessors.end(event)
      var start = accessors.start(event)
      var format = 'eventTimeRangeFormat'
      var label
      var startsBeforeDay = slotMetrics.startsBeforeDay(start)
      var startsAfterDay = slotMetrics.startsAfterDay(end)
      if (startsBeforeDay) format = 'eventTimeRangeEndFormat'
      else if (startsAfterDay) format = 'eventTimeRangeStartFormat'
      if (startsBeforeDay && startsAfterDay) label = messages.allDay
      else
        label = localizer.format(
          {
            start: start,
            end: end,
          },
          format
        )
      var continuesPrior = startsBeforeDay || slotMetrics.startsBefore(start)
      var continuesAfter = startsAfterDay || slotMetrics.startsAfter(end)
      return /*#__PURE__*/ _react.default.createElement(
        _TimeGridEvent.default,
        {
          style: style,
          event: event,
          label: label,
          key: 'evt_' + idx,
          getters: getters,
          rtl: rtl,
          components: components,
          continuesPrior: continuesPrior,
          continuesAfter: continuesAfter,
          accessors: accessors,
          resource: resource,
          selected: (0, _selection.isSelected)(event, selected),
          onClick: function onClick(e) {
            return select(
              (0, _objectSpread2.default)(
                (0, _objectSpread2.default)({}, event),
                {},
                {
                  sourceResource: resource,
                }
              ),
              e
            )
          },
          onDoubleClick: function onDoubleClick(e) {
            return doubleClick(event, e)
          },
          isBackgroundEvent: isBackgroundEvent,
          onKeyPress: function onKeyPress(e) {
            return keyPress(event, e)
          },
          resizable: resizable,
        }
      )
    })
  }
  function _selectable() {
    var node = containerRef.current
    var selector = new _Selection.default(
      function () {
        return node
      },
      {
        longPressThreshold: longPressThreshold,
      }
    )
    setSelector(selector)
    var maybeSelect = function maybeSelect(box) {
      var tempSelectionState = getTempSelectionState(box)
      var start = tempSelectionState.startDate,
        end = tempSelectionState.endDate
      if (onSelecting) {
        if (
          (localizer.eq(selectionState.startDate, start, 'minutes') &&
            localizer.eq(selectionState.endDate, end, 'minutes')) ||
          onSelecting({
            start: start,
            end: end,
            resourceId: resource,
          }) === false
        )
          return
      }
      if (
        selectionState.start !== tempSelectionState.start ||
        selectionState.end !== tempSelectionState.end ||
        selectionState.selecting !== tempSelectionState.selecting
      ) {
        setSelectionState(tempSelectionState)
      }
    }
    var getTempSelectionState = function getTempSelectionState(point) {
      var currentSlot = slotMetrics.closestSlotFromPoint(
        point,
        (0, _Selection.getBoundsForNode)(node)
      )
      var initialSlot = !selectionState.selecting ? currentSlot : undefined
      if (localizer.lte(initialSlot, currentSlot)) {
        currentSlot = slotMetrics.nextSlot(currentSlot)
      } else if (localizer.gt(initialSlot, currentSlot)) {
        initialSlot = slotMetrics.nextSlot(initialSlot)
      }
      var selectRange = slotMetrics.getRange(
        localizer.min(initialSlot, currentSlot),
        localizer.max(initialSlot, currentSlot)
      )
      return (0, _objectSpread2.default)(
        (0, _objectSpread2.default)({}, selectRange),
        {},
        {
          selecting: true,
          top: ''.concat(selectRange.top, '%'),
          height: ''.concat(selectRange.height, '%'),
        }
      )
    }
    var selectorClicksHandler = function selectorClicksHandler(
      box,
      actionType
    ) {
      if (!(0, _Selection.isEvent)(containerRef.current, box)) {
        var _getTempSelectionStat = getTempSelectionState(box),
          startDate = _getTempSelectionStat.startDate,
          endDate = _getTempSelectionStat.endDate
        selectSlot({
          startDate: startDate,
          endDate: endDate,
          action: actionType,
          box: box,
        })
      }
      setSelectionState(
        (0, _objectSpread2.default)(
          (0, _objectSpread2.default)({}, selectionState),
          {},
          {
            selecting: false,
          }
        )
      )
    }
    selector.on('selecting', maybeSelect)
    selector.on('selectStart', maybeSelect)
    selector.on('beforeSelect', function (box) {
      if (selectable !== 'ignoreEvents') return
      return !(0, _Selection.isEvent)(containerRef.current, box)
    })
    selector.on('click', function (box) {
      return selectorClicksHandler(box, 'click')
    })
    selector.on('doubleClick', function (box) {
      return selectorClicksHandler(box, 'doubleClick')
    })
    selector.on('select', function (bounds) {
      if (selectionState.selecting) {
        selectSlot(
          (0, _objectSpread2.default)(
            (0, _objectSpread2.default)({}, selectionState),
            {},
            {
              action: 'select',
              bounds: bounds,
            }
          )
        )
        setSelectionState(
          (0, _objectSpread2.default)(
            (0, _objectSpread2.default)({}, selectionState),
            {},
            {
              selecting: false,
            }
          )
        )
      }
    })
    selector.on('reset', function () {
      if (selectionState.selecting) {
        setSelectionState(
          (0, _objectSpread2.default)(
            (0, _objectSpread2.default)({}, selectionState),
            {},
            {
              selecting: false,
            }
          )
        )
      }
    })
  }
  function teardownSelectable() {
    if (!selector) return
    selector.teardown()
    setSelector(null)
  }
  function selectSlot(_ref4) {
    var startDate = _ref4.startDate,
      endDate = _ref4.endDate,
      action = _ref4.action,
      bounds = _ref4.bounds,
      box = _ref4.box
    var current = startDate,
      slots = []
    while (localizer.lte(current, endDate)) {
      slots.push(current)
      current = new Date(+current + step * 60 * 1000) // using Date ensures not to create an endless loop the day DST begins
    }

    ;(0, _helpers.notify)(onSelectSlot, {
      slots: slots,
      start: startDate,
      end: endDate,
      resourceId: resource,
      action: action,
      bounds: bounds,
      box: box,
    })
  }
  function select() {
    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }
    ;(0, _helpers.notify)(onSelectEvent, args)
  }
  function doubleClick() {
    for (
      var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
      _key2 < _len2;
      _key2++
    ) {
      args[_key2] = arguments[_key2]
    }
    ;(0, _helpers.notify)(onDoubleClickEvent, args)
  }
  function keyPress() {
    for (
      var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
      _key3 < _len3;
      _key3++
    ) {
      args[_key3] = arguments[_key3]
    }
    ;(0, _helpers.notify)(onKeyPressEvent, args)
  }
}
DayColumn.defaultProps = {
  dragThroughEvents: true,
  timeslots: 2,
}
var _default = DayColumn
exports.default = _default
