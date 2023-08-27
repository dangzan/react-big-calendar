'use strict'

var _interopRequireDefault =
  require('@babel/runtime/helpers/interopRequireDefault').default
var _interopRequireWildcard =
  require('@babel/runtime/helpers/interopRequireWildcard').default
Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
var _objectWithoutProperties2 = _interopRequireDefault(
  require('@babel/runtime/helpers/objectWithoutProperties')
)
var _toConsumableArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/toConsumableArray')
)
var _slicedToArray2 = _interopRequireDefault(
  require('@babel/runtime/helpers/slicedToArray')
)
var _react = _interopRequireWildcard(require('react'))
var _clsx = _interopRequireDefault(require('clsx'))
var _chunk = _interopRequireDefault(require('lodash/chunk'))
var _constants = require('./utils/constants')
var _helpers = require('./utils/helpers')
var _position = _interopRequireDefault(require('dom-helpers/position'))
var animationFrame = _interopRequireWildcard(
  require('dom-helpers/animationFrame')
)
var _PopOverlay = _interopRequireDefault(require('./PopOverlay'))
var _DateContentRow = _interopRequireDefault(require('./DateContentRow'))
var _Header = _interopRequireDefault(require('./Header'))
var _DateHeader = _interopRequireDefault(require('./DateHeader'))
var _eventLevels = require('./utils/eventLevels')
var _excluded = ['date', 'className']
var eventsForWeek = function eventsForWeek(
  evts,
  start,
  end,
  accessors,
  localizer
) {
  return evts.filter(function (e) {
    return (0, _eventLevels.inRange)(e, start, end, accessors, localizer)
  })
}
var MonthView = function MonthView(props) {
  var events = props.events,
    date = props.date,
    getNow = props.getNow,
    rtl = props.rtl,
    resizable = props.resizable,
    accessors = props.accessors,
    components = props.components,
    getters = props.getters,
    localizer = props.localizer,
    selected = props.selected,
    selectable = props.selectable,
    longPressThreshold = props.longPressThreshold,
    onShowMore = props.onShowMore,
    showAllEvents = props.showAllEvents,
    doShowMoreDrillDown = props.doShowMoreDrillDown,
    onDrillDown = props.onDrillDown,
    getDrilldownView = props.getDrilldownView,
    popup = props.popup,
    popupOffset = props.popupOffset,
    handleDragStart = props.handleDragStart

  // with needLimitMeasure set to true, we get that dummyRow which flickers broken ui
  var _useState = (0, _react.useState)({
      rowLimit: 5,
      needLimitMeasure: false,
    }),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    state = _useState2[0],
    setState = _useState2[1]
  var _useState3 = (0, _react.useState)(null),
    _useState4 = (0, _slicedToArray2.default)(_useState3, 2),
    overlay = _useState4[0],
    setOverlay = _useState4[1]
  var containerRef = (0, _react.useRef)(null)
  var slotRowRef = (0, _react.useRef)(null)
  // using this to replace getDerivedPropsFromState
  var prevDatePropRef = (0, _react.useRef)()
  var _pendingSelection = (0, _react.useRef)([])
  var _selectTimer = (0, _react.useRef)(null)

  // storing previous props to do comparison later with current props
  ;(0, _react.useEffect)(
    function () {
      if (prevDatePropRef.current) prevDatePropRef.current.date = date
    },
    [date]
  )
  ;(0, _react.useEffect)(function () {
    var running
    if (state.needLimitMeasure) measureRowLimit()
    var resizeListener = function resizeListener() {
      if (!running) {
        // adding this bc otherwise it is always false. not sure how it helps though.
        running = true
        animationFrame.request(function () {
          running = false
          setState({
            needLimitMeasure: true,
          })
        })
      }
    }
    window.addEventListener('resize', resizeListener, false)
    return function () {
      window.removeEventListener('resize', resizeListener, false)
    }
  }, [])
  ;(0, _react.useEffect)(
    function () {
      if (state.needLimitMeasure) measureRowLimit()
    },
    [state.needLimitMeasure]
  )
  ;(0, _react.useEffect)(
    function () {
      if (prevDatePropRef.current) {
        setState({
          needLimitMeasure: localizer.neq(
            date,
            prevDatePropRef.current.date,
            'month'
          ),
        })
      }
    },
    [date]
  )
  function getContainer() {
    return containerRef.current
  }
  var month = localizer.visibleDays(date, localizer)
  var weeks = (0, _chunk.default)(month, 7)
  return /*#__PURE__*/ _react.default.createElement(
    'div',
    {
      className: (0, _clsx.default)(
        'rbc-month-view',
        props.className ? props.className : ''
      ),
      role: 'table',
      'aria-label': 'Month View',
      ref: containerRef,
    },
    /*#__PURE__*/ _react.default.createElement(
      'div',
      {
        className: 'rbc-row rbc-month-header',
        role: 'row',
      },
      renderHeaders(weeks[0])
    ),
    weeks.map(renderWeek),
    popup && renderOverlay()
  )
  function renderWeek(week, weekIdx) {
    var needLimitMeasure = state.needLimitMeasure,
      rowLimit = state.rowLimit

    // let's not mutate props
    var weeksEvents = eventsForWeek(
      (0, _toConsumableArray2.default)(events),
      week[0],
      week[week.length - 1],
      accessors,
      localizer
    )
    weeksEvents.sort(function (a, b) {
      return (0, _eventLevels.sortEvents)(a, b, accessors, localizer)
    })
    return /*#__PURE__*/ _react.default.createElement(_DateContentRow.default, {
      key: weekIdx,
      ref: weekIdx === 0 ? slotRowRef : undefined,
      container: getContainer,
      className: 'rbc-month-row',
      getNow: getNow,
      date: date,
      range: week,
      events: weeksEvents,
      maxRows: showAllEvents ? Infinity : rowLimit,
      selected: selected,
      selectable: selectable,
      components: components,
      accessors: accessors,
      getters: getters,
      localizer: localizer,
      renderHeader: renderDateHeading,
      renderForMeasure: needLimitMeasure,
      onShowMore: handleShowMore,
      onSelect: handleSelectEvent,
      onDoubleClick: handleDoubleClickEvent,
      onKeyPress: handleKeyPressEvent,
      onSelectSlot: handleSelectSlot,
      longPressThreshold: longPressThreshold,
      rtl: rtl,
      resizable: resizable,
      showAllEvents: showAllEvents,
    })
  }
  function renderDateHeading(_ref) {
    var date = _ref.date,
      className = _ref.className,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded)
    var currentDate = props.date,
      localizer = props.localizer
    var isOffRange = localizer.neq(date, currentDate, 'month')
    var isCurrent = localizer.isSameDate(date, currentDate)
    var drilldownView = getDrilldownView(date)
    var label = localizer.format(date, 'dateFormat')
    var DateHeaderComponent = components.dateHeader || _DateHeader.default
    return /*#__PURE__*/ _react.default.createElement(
      'div',
      Object.assign({}, props, {
        className: (0, _clsx.default)(
          className,
          isOffRange && 'rbc-off-range',
          isCurrent && 'rbc-current'
        ),
        role: 'cell',
      }),
      /*#__PURE__*/ _react.default.createElement(DateHeaderComponent, {
        label: label,
        date: date,
        drilldownView: drilldownView,
        isOffRange: isOffRange,
        onDrillDown: function onDrillDown(e) {
          return handleHeadingClick(date, drilldownView, e)
        },
      })
    )
  }
  function renderHeaders(row) {
    var first = row[0]
    var last = row[row.length - 1]
    var HeaderComponent = components.header || _Header.default
    return localizer.range(first, last, 'day').map(function (day, idx) {
      return /*#__PURE__*/ _react.default.createElement(
        'div',
        {
          key: 'header_' + idx,
          className: 'rbc-header',
        },
        /*#__PURE__*/ _react.default.createElement(HeaderComponent, {
          date: day,
          localizer: localizer,
          label: localizer.format(day, 'weekdayFormat'),
        })
      )
    })
  }
  function renderOverlay() {
    // modifying original which was not reading overlay created by useState
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
      show: !!currentOverlay.position,
      overlayDisplay: overlayDisplay,
      onHide: onHide,
    })

    /* return (
      <Overlay
        rootClose
        placement="bottom"
        show={!!overlay.position}
        onHide={() => setOverlay(null)}
        target={() => overlay.target}
      >
        {({ props }) => (
          <Popup
            {...props}
            popupOffset={popupOffset}
            accessors={accessors}
            getters={getters}
            selected={selected}
            components={components}
            localizer={localizer}
            position={overlay.position}
            show={overlayDisplay}
            events={overlay.events}
            slotStart={overlay.date}
            slotEnd={overlay.end}
            onSelect={handleSelectEvent}
            onDoubleClick={handleDoubleClickEvent}
            onKeyPress={handleKeyPressEvent}
            handleDragStart={props.handleDragStart}
          />
        )}
      </Overlay>
    ) */
  }

  function measureRowLimit() {
    setState({
      needLimitMeasure: false,
      rowLimit: slotRowRef.current.getRowLimit(),
    })
  }
  function handleSelectSlot(range, slotInfo) {
    _pendingSelection.current = _pendingSelection.current.concat(range)
    clearTimeout(_selectTimer)
    _selectTimer = setTimeout(function () {
      return selectDates(slotInfo)
    })
  }
  function handleHeadingClick(date, view, e) {
    e.preventDefault()
    clearSelection()
    ;(0, _helpers.notify)(props.onDrillDown, [date, view])
  }
  function handleSelectEvent() {
    clearSelection()
    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }
    ;(0, _helpers.notify)(props.onSelectEvent, args)
  }
  function handleDoubleClickEvent() {
    clearSelection()
    for (
      var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
      _key2 < _len2;
      _key2++
    ) {
      args[_key2] = arguments[_key2]
    }
    ;(0, _helpers.notify)(props.onDoubleClickEvent, args)
  }
  function handleKeyPressEvent() {
    clearSelection()
    for (
      var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
      _key3 < _len3;
      _key3++
    ) {
      args[_key3] = arguments[_key3]
    }
    ;(0, _helpers.notify)(props.onKeyPressEvent, args)
  }
  function handleShowMore(events, date, cell, slot, target) {
    //cancel any pending selections so only the event click goes through.
    clearSelection()
    if (popup) {
      var position = (0, _position.default)(cell, containerRef.current)
      setOverlay({
        date: date,
        events: events,
        position: position,
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
  function overlayDisplay() {
    setOverlay(null)
  }
  function selectDates(slotInfo) {
    var slots = _pendingSelection.current.slice()
    _pendingSelection.current = []
    slots.sort(function (a, b) {
      return +a - +b
    })
    var start = new Date(slots[0])
    var end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)
    ;(0, _helpers.notify)(props.onSelectSlot, {
      slots: slots,
      start: start,
      end: end,
      action: slotInfo.action,
      bounds: slotInfo.bounds,
      box: slotInfo.box,
    })
  }
  function clearSelection() {
    clearTimeout(_selectTimer)
    _pendingSelection.current = []
  }
}
MonthView.range = function (date, _ref2) {
  var localizer = _ref2.localizer
  var start = localizer.firstVisibleDay(date, localizer)
  var end = localizer.lastVisibleDay(date, localizer)
  return {
    start: start,
    end: end,
  }
}
MonthView.navigate = function (date, action, _ref3) {
  var localizer = _ref3.localizer
  switch (action) {
    case _constants.navigate.PREVIOUS:
      return localizer.add(date, -1, 'month')
    case _constants.navigate.NEXT:
      return localizer.add(date, 1, 'month')
    default:
      return date
  }
}
MonthView.title = function (date, _ref4) {
  var localizer = _ref4.localizer
  return localizer.format(date, 'monthHeaderFormat')
}
var _default = MonthView
exports.default = _default
