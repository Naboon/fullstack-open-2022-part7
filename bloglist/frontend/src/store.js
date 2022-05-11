import { configureStore } from '@reduxjs/toolkit'
import notificationReducer from './reducers/notificationReducer'
import { blogsApi } from './services/blogsApi'

const store = configureStore({
  reducer: {
    notification: notificationReducer,
    [blogsApi.reducerPath]: blogsApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(blogsApi.middleware)
})

export default store
