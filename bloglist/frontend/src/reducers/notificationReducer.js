import { createSlice } from '@reduxjs/toolkit'

// let timerId = undefined

const initialState = {
  message: '',
  type: 'info'
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotification: (state, action) => action.payload,
    resetNotification: () => initialState
  }
})

export const { setNotification, resetNotification } = notificationSlice.actions

// export const notify = (message, type = 'info') => {
//   console.log('notify called!')
//   console.log(setNotification({ message: message, type: type }))

//   return (dispatch) => {
//     if (timerId) {
//       clearTimeout(timerId)
//     }

//     dispatch(setNotification({ message: message, type: type }))

//     timerId = setTimeout(() => {
//       dispatch(resetNotification())
//     }, 5000)
//   }
// }

export default notificationSlice.reducer
