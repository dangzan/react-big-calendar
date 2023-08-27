'use strict'

var _interopRequireWildcard =
  require('@babel/runtime/helpers/interopRequireWildcard').default
var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
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
var _react = _interopRequireWildcard(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var animationFrame = _interopRequireWildcard(
  require('dom-helpers/animationFrame')
)
var _memoizeOne = _interopRequireDefault(require('memoize-one'))
var _DayColumn = _interopRequireDefault(require('./DayColumn'))
var _TimeGutter = _interopRequireDefault(require('./TimeGutter'))
var _TimeGridHeader = _interopRequireDefault(require('./TimeGridHeader'))
var _PopOverlay = _interopRequireDefault(require('./PopOverlay'))
var _width = _interopRequireDefault(require('dom-helpers/width'))
var _position = _interopRequireDefault(require('dom-helpers/position'))
var _constants = require('./utils/constants')
var _eventLevels = require('./utils/eventLevels')
var _helpers = require('./utils/helpers')
var _Resources = _interopRequireDefault(require('./utils/Resources'))
var _propTypes = require('./utils/propTypes')
var TimeGrid = function TimeGrid(props) {
  var events = props.events,
    backgroundEvents = props.backgroundEvents,
    range = props.range,
    width = props.width,
    rtl = props.rtl,
    selected = props.selected,
    getNow = props.getNow,
    resources = props.resources,
    components = props.components,
    accessors = props.accessors,
    getters = props.getters,
    localizer = props.localizer,
    onSelectSlot = props.onSelectSlot,
    min = props.min,
    max = props.max,
    showMultiDayTimes = props.showMultiDayTimes,
    longPressThreshold = props.longPressThreshold,
    popup = props.popup,
    onDrillDown = props.onDrillDown,
    onShowMore = props.onShowMore,
    getDrilldownView = props.getDrilldownView,
    doShowMoreDrillDown = props.doShowMoreDrillDown,
    resizable = props.resizable,
    popupOffset = props.popupOffset,
    handleDragStart = props.handleDragStart,
    step = props.step,
    timeslots = props.timeslots,
    scrollToTime = props.scrollToTime,
    enableAutoScroll = props.enableAutoScroll,
    allDayMaxRows = props.allDayMaxRows,
    selectable = props.selectable,
    onSelectEvent = props.onSelectEvent,
    onDoubleClickEvent = props.onDoubleClickEvent,
    onKeyPressEvent = props.onKeyPressEvent,
    dayLayoutAlgorithm = props.dayLayoutAlgorithm,
    showAllEvents = props.showAllEvents
  var _useState = (0, _react.useState)(),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    gutterWidth = _useState2[0],
    setGutterWidth = _useState2[1]
  var _useState3 = (0, _react.useState)(),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    isOverflowing = _useState4[0],
    setIsOverflowing = _useState4[1]
  var _useState5 = (0, _react.useState)(),
    _useState6 = (0, _slicedToArray2.default)(_useState5, 2),
    rafHandle = _useState6[0],
    setRafHandle = _useState6[1]
  var _useState7 = (0, _react.useState)(),
    _useState8 = (0, _slicedToArray2.default)(_useState7, 2),
    measureGutterAnimationFrameRequest = _useState8[0],
    setMeasureGutterAnimationFrameRequest = _useState8[1]
  var _useState9 = (0, _react.useState)(),
    _useState10 = (0, _slicedToArray2.default)(_useState9, 2),
    overlay = _useState10[0],
    setOverlay = _useState10[1]
  var updatingOverflowRef = (0, _react.useRef)(false)
  var scrollRef = (0, _react.useRef)()
  var contentRef = (0, _react.useRef)()
  var containerRef = (0, _react.useRef)()
  var scrollRatio = (0, _react.useRef)()
  var gutterRef = (0, _react.useRef)()
  var pendingSelection = (0, _react.useRef)()
  var timeoutId // this never gets assigned to in original; placeholder for now to prevent error

  ;(0, _react.useEffect)(
    function () {
      if (updatingOverflowRef.current) {
        updatingOverflowRef.current = false
      }
    },
    [isOverflowing]
  )
  ;(0, _react.useEffect)(function () {
    checkOverflow()
    if (width == null) {
      measureGutter()
    }
    calculateScroll()
    applyScroll()
    window.addEventListener('resize', handleResize)
    return function () {
      window.removeEventListener('resize', handleResize)
      animationFrame.cancel(rafHandle)
      if (measureGutterAnimationFrameRequest) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest)
      }
    }
  }, [])
  var memoizedResources = (0, _memoizeOne.default)(function (
    resources,
    accessors
  ) {
    return (0, _Resources.default)(resources, accessors)
  })
  function handleScroll(e) {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }
  function handleResize() {
    animationFrame.cancel(rafHandle)
    setRafHandle(animationFrame.request(checkOverflow))
  }
  var handleKeyPressEvent = function handleKeyPressEvent() {
    clearSelection()
    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }
    ;(0, _helpers.notify)(onKeyPressEvent, args)
  }
  var handleSelectEvent = function handleSelectEvent() {
    //cancel any pending selections so only the event click goes through.
    clearSelection()
    for (
      var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
      _key2 < _len2;
      _key2++
    ) {
      args[_key2] = arguments[_key2]
    }
    ;(0, _helpers.notify)(onSelectEvent, args)
  }
  var handleDoubleClickEvent = function handleDoubleClickEvent() {
    clearSelection()
    for (
      var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
      _key3 < _len3;
      _key3++
    ) {
      args[_key3] = arguments[_key3]
    }
    ;(0, _helpers.notify)(onDoubleClickEvent, args)
  }
  var handleShowMore = function handleShowMore(
    events,
    date,
    cell,
    slot,
    target
  ) {
    clearSelection()
    if (popup) {
      var position = (0, _position.default)(cell, containerRef.current)
      setOverlay({
        date: date,
        events: events,
        position: (0, _objectSpread2.default)(
          (0, _objectSpread2.default)({}, position),
          {},
          {
            width: '200px',
          }
        ),
        target: target,
      })
    } else if (doShowMoreDrillDown) {
      ;(0, _helpers.notify)(onDrillDown, [
        date,
        getDrilldownView(date) || _constants.views.DAY,
      ])
    }
    ;(0, _helpers.notify)(onShowMore, [events, date, slot])
  }
  var handleSelectAllDaySlot = function handleSelectAllDaySlot(
    slots,
    slotInfo
  ) {
    var start = new Date(slots[0])
    var end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)
    ;(0, _helpers.notify)(onSelectSlot, {
      slots: slots,
      start: start,
      end: end,
      action: slotInfo.action,
      resourceId: slotInfo.resourceId,
    })
  }

  // now param passed by getNow() in args
  function renderDayColumns(range, events, backgroundEvents, now) {
    var resources = memoizedResources(resources, accessors)
    var groupedEvents = resources.groupEvents(events)
    var groupedBackgroundEvents = resources.groupEvents(backgroundEvents)
    return resources.map(function (_ref, i) {
      var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        id = _ref2[0],
        resource = _ref2[1]
      return range.map(function (date, jj) {
        // jj is for key but not advised to use index for key
        var daysEvents = (groupedEvents.get(id) || []).filter(function (event) {
          return localizer.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        })
        var daysBackgroundEvents = (
          groupedBackgroundEvents.get(id) || []
        ).filter(function (event) {
          return localizer.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        })
        // date is the element type in the range array that TimeGrid accepts as a prop
        // now is from getNow() which is an arg to renderDayColumns
        // isNow is really isToday
        return /*#__PURE__*/ _react.default.createElement(
          _DayColumn.default,
          Object.assign({}, props, {
            localizer: localizer,
            min: localizer.merge(date, min),
            max: localizer.merge(date, max),
            resource: resource && id,
            components: components,
            isNow: localizer.isSameDate(date, now),
            key: i + '-' + jj,
            date: date,
            events: daysEvents,
            backgroundEvents: daysBackgroundEvents,
            dayLayoutAlgorithm: dayLayoutAlgorithm,
          })
        )
      })
    })
  }
  var start = range[0],
    end = range[range.length - 1]
  var allDayEvents = [],
    rangeEvents = [],
    rangeBackgroundEvents = []
  events.forEach(function (event) {
    if ((0, _eventLevels.inRange)(event, start, end, accessors, localizer)) {
      var eStart = accessors.start(event),
        eEnd = accessors.end(event)
      if (
        accessors.allDay(event) ||
        localizer.startAndEndAreDateOnly(eStart, eEnd) ||
        (!showMultiDayTimes && !localizer.isSameDate(eStart, eEnd))
      ) {
        allDayEvents.push(event)
      } else {
        rangeEvents.push(event)
      }
    }
  })
  backgroundEvents.forEach(function (event) {
    if ((0, _eventLevels.inRange)(event, start, end, accessors, localizer)) {
      rangeBackgroundEvents.push(event)
    }
  })
  allDayEvents.sort(function (a, b) {
    return (0, _eventLevels.sortEvents)(a, b, accessors, localizer)
  })
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: (0, _clsx.default)(
        'rbc-time-view',
        resources && 'rbc-time-view-resources'
      ),
      ref: containerRef,
    },
    /*#__PURE__*/ _react.default.createElement(_TimeGridHeader.default, {
      range: range,
      events: allDayEvents,
      width: width || gutterWidth,
      rtl: rtl,
      getNow: getNow,
      localizer: localizer,
      selected: selected,
      allDayMaxRows: showAllEvents
        ? Infinity
        : allDayMaxRows !== null && allDayMaxRows !== void 0
        ? allDayMaxRows
        : Infinity,
      resources: memoizedResources(resources, accessors),
      selectable: selectable,
      accessors: accessors,
      getters: getters,
      components: components,
      scrollRef: scrollRef,
      isOverflowing: isOverflowing,
      longPressThreshold: longPressThreshold,
      onSelectSlot: handleSelectAllDaySlot,
      onSelectEvent: handleSelectEvent,
      onShowMore: handleShowMore,
      onDoubleClickEvent: onDoubleClickEvent,
      onKeyPressEvent: onKeyPressEvent,
      onDrillDown: onDrillDown,
      getDrilldownView: getDrilldownView,
      resizable: resizable,
    }),
    popup && renderOverlay(),
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        ref: contentRef,
        className: 'rbc-time-content',
        onScroll: handleScroll,
      },
      /*#__PURE__*/ _react.default.createElement(_TimeGutter.default, {
        date: start,
        ref: gutterRef,
        localizer: localizer,
        min: localizer.merge(start, min),
        max: localizer.merge(start, max),
        step: step,
        getNow: getNow,
        timeslots: timeslots,
        components: components,
        className: 'rbc-time-gutter',
        getters: getters,
      }),
      renderDayColumns(range, rangeEvents, rangeBackgroundEvents, getNow())
    )
  )
  function renderOverlay() {
    var currentOverlay = overlay !== null && overlay !== void 0 ? overlay : {}
    var onHide = function onHide() {
      return setOverlay(null)
    }
    return /*#__PURE__*/ _react.default.createElement(_PopOverlay.default, {
      overlay: currentOverlay,
      accessors: accessors,
      localizer: localizer,
      components: components,
      getters: getters,
      selected: selected,
      popupOffset: popupOffset,
      ref: containerRef,
      handleKeyPressEvent: handleKeyPressEvent,
      handleSelectEvent: handleSelectEvent,
      handleDoubleClickEvent: handleDoubleClickEvent,
      handleDragStart: handleDragStart,
      show: !!(
        currentOverlay !== null &&
        currentOverlay !== void 0 &&
        currentOverlay.position
      ),
      overlayDisplay: overlayDisplay,
      onHide: onHide,
    })
  }
  function overlayDisplay() {
    setOverlay(null)
  }
  function clearSelection() {
    clearTimeout(timeoutId)
    pendingSelection.current = []
  }
  function measureGutter() {
    if (measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(measureGutterAnimationFrameRequest)
    }
    var requestAnimationFrameValue = window.requestAnimationFrame(function () {
      var width =
        gutterRef !== null && gutterRef !== void 0 && gutterRef.current
          ? (0, _width.default)(gutterRef.current)
          : undefined
      if (width && gutterWidth !== width) {
        setGutterWidth(width)
      }
    })
    setMeasureGutterAnimationFrameRequest(requestAnimationFrameValue)
  }
  function applyScroll() {
    // If auto-scroll is disabled, we don't actually apply the scroll
    if (scrollRatio.current != null && enableAutoScroll === true) {
      var content = contentRef.current
      content.scrollTop = content.scrollHeight * scrollRatio.current
      // Only do this once
      scrollRatio.current = null
    }
  }
  function calculateScroll() {
    var diffMillis = localizer.diff(
      localizer.merge(scrollToTime, min),
      scrollToTime,
      'milliseconds'
    )
    var totalMillis = localizer.diff(min, max, 'milliseconds')
    scrollRatio.current = diffMillis / totalMillis
  }
  function checkOverflow() {
    if (updatingOverflowRef.current) return
    var content = contentRef.current
    var isContentOverflowing = content.scrollHeight > content.clientHeight
    if (isOverflowing !== isContentOverflowing) {
      updatingOverflowRef.current = true
      setIsOverflowing(isContentOverflowing)
    }
  }
}
TimeGrid.defaultProps = {
  step: 30,
  timeslots: 2,
}
var _default = TimeGrid
exports.default = _default
