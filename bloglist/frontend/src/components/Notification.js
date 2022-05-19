import { useSelector } from 'react-redux'

import { Alert } from '@mui/material'

const Notification = () => {
  const notification = useSelector((state) => state.notification)

  if (notification.message === '') {
    return null
  }

  const style = notification.type === 'alert' ? 'error' : 'success'

  return (
    // <div id="notification" style={style}>
    //   {notification.message}
    // </div>
    <Alert id="notification" severity={style}>
      {notification.message}
    </Alert>
  )
}

export default Notification
