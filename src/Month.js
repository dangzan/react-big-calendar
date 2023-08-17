import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import chunk from 'lodash/chunk'

import { navigate, views } from './utils/constants'
import { notify } from './utils/helpers'
import getPosition from 'dom-helpers/position'
import * as animationFrame from 'dom-helpers/animationFrame'

/* import Popup from './Popup'
import Overlay from 'react-overlays/Overlay' */
import PopOverlay from './PopOverlay'
import DateContentRow from './DateContentRow'
import Header from './Header'
import DateHeader from './DateHeader'

import { inRange, sortEvents } from './utils/eventLevels'

let eventsForWeek = (evts, start, end, accessors, localizer) =>
  evts.filter((e) => inRange(e, start, end, accessors, localizer))

const MonthView = (props) => {
  const {
    events,
    date,
    getNow,
    rtl,
    resizable,
    accessors,
    components,
    getters,
    localizer,
    selected,
    selectable,
    longPressThreshold,
    onShowMore,
    showAllEvents,
    doShowMoreDrillDown,
    onDrillDown,
    getDrilldownView,
    popup,
    popupOffset,
    handleDragStart,
  } = props

  // with needLimitMeasure set to true, we get that dummyRow which flickers broken ui
  const [state, setState] = useState({
    rowLimit: 5,
    needLimitMeasure: false,
  })
  const [overlay, setOverlay] = useState(null)

  const containerRef = useRef(null)
  const slotRowRef = useRef(null)
  // using this to replace getDerivedPropsFromState
  const prevDatePropRef = useRef()

  const _pendingSelection = useRef([])
  let _selectTimer = useRef(null)

  // storing previous props to do comparison later with current props
  useEffect(() => {
    if (prevDatePropRef.current) prevDatePropRef.current.date = date
  }, [date])

  useEffect(() => {
    let running
    if (state.needLimitMeasure) measureRowLimit()

    const resizeListener = () => {
      if (!running) {
        // adding this bc otherwise it is always false. not sure how it helps though.
        running = true
        animationFrame.request(() => {
          running = false
          setState({ needLimitMeasure: true })
        })
      }
    }

    window.addEventListener('resize', resizeListener, false)

    return () => {
      window.removeEventListener('resize', resizeListener, false)
    }
  }, [])

  useEffect(() => {
    if (state.needLimitMeasure) measureRowLimit()
  }, [state.needLimitMeasure])

  useEffect(() => {
    if (prevDatePropRef.current) {
      setState({
        needLimitMeasure: localizer.neq(
          date,
          prevDatePropRef.current.date,
          'month'
        ),
      })
    }
  }, [date])

  function getContainer() {
    return containerRef.current
  }

  let month = localizer.visibleDays(date, localizer)
  let weeks = chunk(month, 7)

  return (
    <div
      className={clsx('rbc-month-view', props.className ? props.className : '')}
      role="table"
      aria-label="Month View"
      ref={containerRef}
    >
      <div className="rbc-row rbc-month-header" role="row">
        {renderHeaders(weeks[0])}
      </div>
      {weeks.map(renderWeek)}
      {popup && renderOverlay()}
    </div>
  )

  function renderWeek(week, weekIdx) {
    const { needLimitMeasure, rowLimit } = state

    // let's not mutate props
    const weeksEvents = eventsForWeek(
      [...events],
      week[0],
      week[week.length - 1],
      accessors,
      localizer
    )

    weeksEvents.sort((a, b) => sortEvents(a, b, accessors, localizer))

    return (
      <DateContentRow
        key={weekIdx}
        ref={weekIdx === 0 ? slotRowRef : undefined}
        container={getContainer}
        className="rbc-month-row"
        getNow={getNow}
        date={date}
        range={week}
        events={weeksEvents}
        maxRows={showAllEvents ? Infinity : rowLimit}
        selected={selected}
        selectable={selectable}
        components={components}
        accessors={accessors}
        getters={getters}
        localizer={localizer}
        renderHeader={renderDateHeading}
        renderForMeasure={needLimitMeasure}
        onShowMore={handleShowMore}
        onSelect={handleSelectEvent}
        onDoubleClick={handleDoubleClickEvent}
        onKeyPress={handleKeyPressEvent}
        onSelectSlot={handleSelectSlot}
        longPressThreshold={longPressThreshold}
        rtl={rtl}
        resizable={resizable}
        showAllEvents={showAllEvents}
      />
    )
  }

  function renderDateHeading({ date, className, ...props }) {
    let { date: currentDate, localizer } = props
    let isOffRange = localizer.neq(date, currentDate, 'month')
    let isCurrent = localizer.isSameDate(date, currentDate)
    let drilldownView = getDrilldownView(date)
    let label = localizer.format(date, 'dateFormat')
    let DateHeaderComponent = components.dateHeader || DateHeader

    return (
      <div
        {...props}
        className={clsx(
          className,
          isOffRange && 'rbc-off-range',
          isCurrent && 'rbc-current'
        )}
        role="cell"
      >
        <DateHeaderComponent
          label={label}
          date={date}
          drilldownView={drilldownView}
          isOffRange={isOffRange}
          onDrillDown={(e) => handleHeadingClick(date, drilldownView, e)}
        />
      </div>
    )
  }

  function renderHeaders(row) {
    let first = row[0]
    let last = row[row.length - 1]
    let HeaderComponent = components.header || Header

    return localizer.range(first, last, 'day').map((day, idx) => (
      <div key={'header_' + idx} className="rbc-header">
        <HeaderComponent
          date={day}
          localizer={localizer}
          label={localizer.format(day, 'weekdayFormat')}
        />
      </div>
    ))
  }

  function renderOverlay() {
    // modifying original which was not reading overlay created by useState
    let currentOverlay = overlay ?? {}

    const onHide = () => setOverlay(null)

    return (
      <PopOverlay
        overlay={currentOverlay}
        accessors={accessors}
        localizer={localizer}
        components={components}
        getters={getters}
        selected={selected}
        popupOffset={popupOffset}
        ref={containerRef}
        handleKeyPressEvent={handleKeyPressEvent}
        handleSelectEvent={handleSelectEvent}
        handleDoubleClickEvent={handleDoubleClickEvent}
        handleDragStart={handleDragStart}
        show={!!currentOverlay.position}
        overlayDisplay={overlayDisplay}
        onHide={onHide}
      />
    )

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
    _selectTimer = setTimeout(() => selectDates(slotInfo))
  }

  function handleHeadingClick(date, view, e) {
    e.preventDefault()
    clearSelection()
    notify(props.onDrillDown, [date, view])
  }

  function handleSelectEvent(...args) {
    clearSelection()
    notify(props.onSelectEvent, args)
  }

  function handleDoubleClickEvent(...args) {
    clearSelection()
    notify(props.onDoubleClickEvent, args)
  }

  function handleKeyPressEvent(...args) {
    clearSelection()
    notify(props.onKeyPressEvent, args)
  }

  function handleShowMore(events, date, cell, slot, target) {
    //cancel any pending selections so only the event click goes through.
    clearSelection()

    if (popup) {
      let position = getPosition(cell, containerRef.current)

      setOverlay({ date, events, position, target })
    } else if (doShowMoreDrillDown) {
      notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }

    notify(onShowMore, [events, date, slot])
  }

  function overlayDisplay() {
    setOverlay(null)
  }

  function selectDates(slotInfo) {
    let slots = _pendingSelection.current.slice()

    _pendingSelection.current = []

    slots.sort((a, b) => +a - +b)

    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    notify(props.onSelectSlot, {
      slots,
      start,
      end,
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

MonthView.propTypes = {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date),
  enableAutoScroll: PropTypes.bool,
  rtl: PropTypes.bool,
  resizable: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  showAllEvents: PropTypes.bool,
  doShowMoreDrillDown: PropTypes.bool,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  popup: PropTypes.bool,
  handleDragStart: PropTypes.func,

  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
}

MonthView.range = (date, { localizer }) => {
  let start = localizer.firstVisibleDay(date, localizer)
  let end = localizer.lastVisibleDay(date, localizer)
  return { start, end }
}

MonthView.navigate = (date, action, { localizer }) => {
  switch (action) {
    case navigate.PREVIOUS:
      return localizer.add(date, -1, 'month')
    case navigate.NEXT:
      return localizer.add(date, 1, 'month')
    default:
      return date
  }
}

MonthView.title = (date, { localizer }) => {
  return localizer.format(date, 'monthHeaderFormat')
}

export default MonthView
