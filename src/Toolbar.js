import PropTypes from 'prop-types'
import React from 'react'
import clsx from 'clsx'
import { navigate } from './utils/constants'

const Toolbar = ({
  localizer: { messages },
  label,
  view,
  views,
  onNavigate,
  onView,
}) => {
  const handleNavigate = (action) => {
    onNavigate(action)
  }

  const handleView = (viewName) => {
    onView(viewName)
  }

  const viewNamesGroup = (messages) => {
    if (views.length > 1) {
      return views.map((name) => (
        <button
          type="button"
          key={name}
          className={clsx({ 'rbc-active': view === name })}
          onClick={() => handleView(name)}
        >
          {messages[name]}
        </button>
      ))
    }
  }

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => handleNavigate(navigate.TODAY)}>
          {messages.today}
        </button>
        <button type="button" onClick={() => handleNavigate(navigate.PREVIOUS)}>
          {messages.previous}
        </button>
        <button type="button" onClick={() => handleNavigate(navigate.NEXT)}>
          {messages.next}
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">{viewNamesGroup(messages)}</span>
    </div>
  )
}

Toolbar.propTypes = {
  view: PropTypes.string.isRequired,
  views: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.node.isRequired,
  localizer: PropTypes.object,
  onNavigate: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
}

export default Toolbar
