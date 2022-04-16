const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  if (type === 'error') {
    return (
      <div className="error">
        {message}
      </div>
    )
  } else if (type === 'notification') {
    return (
      <div className="notification">
        {message}
      </div>
    )
  } else {
    return null
  }
}

export default Notification