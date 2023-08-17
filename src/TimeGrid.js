import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import * as animationFrame from 'dom-helpers/animationFrame'
import memoize from 'memoize-one'

import DayColumn from './DayColumn'
import TimeGutter from './TimeGutter'
import TimeGridHeader from './TimeGridHeader'
import PopOverlay from './PopOverlay'

import getWidth from 'dom-helpers/width'
import getPosition from 'dom-helpers/position'
import { views } from './utils/constants'
import { inRange, sortEvents } from './utils/eventLevels'
import { notify } from './utils/helpers'
import Resources from './utils/Resources'
import { DayLayoutAlgorithmPropType } from './utils/propTypes'

const TimeGrid = (props) => {
  const {
    events,
    backgroundEvents,
    range,
    width,
    rtl,
    selected,
    getNow,
    resources,
    components,
    accessors,
    getters,
    localizer,
    onSelectSlot,
    min,
    max,
    showMultiDayTimes,
    longPressThreshold,
    popup,
    onDrillDown,
    onShowMore,
    getDrilldownView,
    doShowMoreDrillDown,
    resizable,
    popupOffset,
    handleDragStart,

    step,
    timeslots,

    scrollToTime,
    enableAutoScroll,

    allDayMaxRows,

    selectable,

    onSelectEvent,
    onDoubleClickEvent,
    onKeyPressEvent,

    dayLayoutAlgorithm,

    showAllEvents,
  } = props

  const [gutterWidth, setGutterWidth] = useState()
  const [isOverflowing, setIsOverflowing] = useState()
  const [rafHandle, setRafHandle] = useState()
  const [
    measureGutterAnimationFrameRequest,
    setMeasureGutterAnimationFrameRequest,
  ] = useState()
  const [overlay, setOverlay] = useState()
  const updatingOverflowRef = useRef(false)
  const scrollRef = useRef()
  const contentRef = useRef()
  const containerRef = useRef()
  const scrollRatio = useRef()
  const gutterRef = useRef()
  const pendingSelection = useRef()

  let timeoutId // this never gets assigned to in original; placeholder for now to prevent error

  useEffect(() => {
    if (updatingOverflowRef.current) {
      updatingOverflowRef.current = false
    }
  }, [isOverflowing])

  useEffect(() => {
    checkOverflow()

    if (width == null) {
      measureGutter()
    }

    calculateScroll()
    applyScroll()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      animationFrame.cancel(rafHandle)

      if (measureGutterAnimationFrameRequest) {
        window.cancelAnimationFrame(measureGutterAnimationFrameRequest)
      }
    }
  }, [])

  const memoizedResources = memoize((resources, accessors) =>
    Resources(resources, accessors)
  )

  function handleScroll(e) {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }

  function handleResize() {
    animationFrame.cancel(rafHandle)
    setRafHandle(animationFrame.request(checkOverflow))
  }

  const handleKeyPressEvent = (...args) => {
    clearSelection()
    notify(onKeyPressEvent, args)
  }

  const handleSelectEvent = (...args) => {
    //cancel any pending selections so only the event click goes through.
    clearSelection()
    notify(onSelectEvent, args)
  }

  const handleDoubleClickEvent = (...args) => {
    clearSelection()
    notify(onDoubleClickEvent, args)
  }

  const handleShowMore = (events, date, cell, slot, target) => {
    clearSelection()

    if (popup) {
      let position = getPosition(cell, containerRef.current)
      setOverlay({
        date,
        events,
        position: { ...position, width: '200px' },
        target,
      })
    } else if (doShowMoreDrillDown) {
      notify(onDrillDown, [date, getDrilldownView(date) || views.DAY])
    }

    notify(onShowMore, [events, date, slot])
  }

  const handleSelectAllDaySlot = (slots, slotInfo) => {
    const start = new Date(slots[0])
    const end = new Date(slots[slots.length - 1])
    end.setDate(slots[slots.length - 1].getDate() + 1)

    notify(onSelectSlot, {
      slots,
      start,
      end,
      action: slotInfo.action,
      resourceId: slotInfo.resourceId,
    })
  }

  // now param passed by getNow() in args
  function renderDayColumns(range, events, backgroundEvents, now) {
    const resources = memoizedResources(resources, accessors)
    const groupedEvents = resources.groupEvents(events)
    const groupedBackgroundEvents = resources.groupEvents(backgroundEvents)

    return resources.map(([id, resource], i) =>
      range.map((date, jj) => {
        // jj is for key but not advised to use index for key
        let daysEvents = (groupedEvents.get(id) || []).filter((event) => {
          return localizer.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        })

        let daysBackgroundEvents = (
          groupedBackgroundEvents.get(id) || []
        ).filter((event) =>
          localizer.inRange(
            date,
            accessors.start(event),
            accessors.end(event),
            'day'
          )
        )
        // date is the element type in the range array that TimeGrid accepts as a prop
        // now is from getNow() which is an arg to renderDayColumns
        // isNow is really isToday
        return (
          <DayColumn
            {...props}
            localizer={localizer}
            min={localizer.merge(date, min)}
            max={localizer.merge(date, max)}
            resource={resource && id}
            components={components}
            isNow={localizer.isSameDate(date, now)}
            key={i + '-' + jj}
            date={date}
            events={daysEvents}
            backgroundEvents={daysBackgroundEvents}
            dayLayoutAlgorithm={dayLayoutAlgorithm}
          />
        )
      })
    )
  }

  let start = range[0],
    end = range[range.length - 1]

  let allDayEvents = [],
    rangeEvents = [],
    rangeBackgroundEvents = []

  events.forEach((event) => {
    if (inRange(event, start, end, accessors, localizer)) {
      let eStart = accessors.start(event),
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

  backgroundEvents.forEach((event) => {
    if (inRange(event, start, end, accessors, localizer)) {
      rangeBackgroundEvents.push(event)
    }
  })

  allDayEvents.sort((a, b) => sortEvents(a, b, accessors, localizer))

  return (
    <div
      className={clsx('rbc-time-view', resources && 'rbc-time-view-resources')}
      ref={containerRef}
    >
      <TimeGridHeader
        range={range}
        events={allDayEvents}
        width={width || gutterWidth}
        rtl={rtl}
        getNow={getNow}
        localizer={localizer}
        selected={selected}
        allDayMaxRows={showAllEvents ? Infinity : allDayMaxRows ?? Infinity}
        resources={memoizedResources(resources, accessors)}
        selectable={selectable}
        accessors={accessors}
        getters={getters}
        components={components}
        scrollRef={scrollRef}
        isOverflowing={isOverflowing}
        longPressThreshold={longPressThreshold}
        onSelectSlot={handleSelectAllDaySlot}
        onSelectEvent={handleSelectEvent}
        onShowMore={handleShowMore}
        onDoubleClickEvent={onDoubleClickEvent}
        onKeyPressEvent={onKeyPressEvent}
        onDrillDown={onDrillDown}
        getDrilldownView={getDrilldownView}
        resizable={resizable}
      />
      {popup && renderOverlay()}
      <div
        ref={contentRef}
        className="rbc-time-content"
        onScroll={handleScroll}
      >
        <TimeGutter
          date={start}
          ref={gutterRef}
          localizer={localizer}
          min={localizer.merge(start, min)}
          max={localizer.merge(start, max)}
          step={step}
          getNow={getNow}
          timeslots={timeslots}
          components={components}
          className="rbc-time-gutter"
          getters={getters}
        />
        {renderDayColumns(range, rangeEvents, rangeBackgroundEvents, getNow())}
      </div>
    </div>
  )

  function renderOverlay() {
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
        show={!!currentOverlay?.position}
        overlayDisplay={overlayDisplay}
        onHide={onHide}
      />
    )
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
    const requestAnimationFrameValue = window.requestAnimationFrame(() => {
      const width = gutterRef?.current ? getWidth(gutterRef.current) : undefined

      if (width && gutterWidth !== width) {
        setGutterWidth(width)
      }
    })
    setMeasureGutterAnimationFrameRequest(requestAnimationFrameValue)
  }

  function applyScroll() {
    // If auto-scroll is disabled, we don't actually apply the scroll
    if (scrollRatio.current != null && enableAutoScroll === true) {
      const content = contentRef.current
      content.scrollTop = content.scrollHeight * scrollRatio.current
      // Only do this once
      scrollRatio.current = null
    }
  }

  function calculateScroll() {
    const diffMillis = localizer.diff(
      localizer.merge(scrollToTime, min),
      scrollToTime,
      'milliseconds'
    )
    const totalMillis = localizer.diff(min, max, 'milliseconds')

    scrollRatio.current = diffMillis / totalMillis
  }

  function checkOverflow() {
    if (updatingOverflowRef.current) return

    const content = contentRef.current
    const isContentOverflowing = content.scrollHeight > content.clientHeight

    if (isOverflowing !== isContentOverflowing) {
      updatingOverflowRef.current = true
      setIsOverflowing(isContentOverflowing)
    }
  }
}

TimeGrid.propTypes = {
  events: PropTypes.array.isRequired,
  backgroundEvents: PropTypes.array.isRequired,
  resources: PropTypes.array,

  step: PropTypes.number,
  timeslots: PropTypes.number,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  getNow: PropTypes.func.isRequired,

  scrollToTime: PropTypes.instanceOf(Date).isRequired,
  enableAutoScroll: PropTypes.bool,
  showMultiDayTimes: PropTypes.bool,

  rtl: PropTypes.bool,
  resizable: PropTypes.bool,
  width: PropTypes.number,

  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,

  allDayMaxRows: PropTypes.number,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onKeyPressEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  dayLayoutAlgorithm: DayLayoutAlgorithmPropType,

  showAllEvents: PropTypes.bool,
  doShowMoreDrillDown: PropTypes.bool,

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

TimeGrid.defaultProps = {
  step: 30,
  timeslots: 2,
}

export default TimeGrid
