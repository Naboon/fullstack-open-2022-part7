import { useState, useEffect, useRef, useMemo } from 'react'

import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import NewBlogForm from './components/NewBlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

import loginService from './services/login'
import userService from './services/user'

import {
  useGetBlogsQuery,
  useAddNewBlogMutation,
  useRemoveBlogMutation,
  useUpdateBlogMutation
} from './services/blogsApi'

import { useDispatch } from 'react-redux'
import {
  setNotification,
  resetNotification
} from './reducers/notificationReducer'

const App = () => {
  const { data: blogs = [], error, isLoading, isSuccess } = useGetBlogsQuery()

  const [
    addNewBlog,
    { error: postError, isError: isPostError }
  ] = useAddNewBlogMutation()

  const [
    deleteBlog,
    { error: deleteError, isError: isDeleteError }
  ] = useRemoveBlogMutation()

  const [updateBlog] = useUpdateBlogMutation()

  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    const userFromStorage = userService.getUser()
    if (userFromStorage) {
      setUser(userFromStorage)
    }
  }, [])

  let timerId = undefined
  const dispatch = useDispatch()

  const byLikes = (b1, b2) => (b2.likes > b1.likes ? 1 : -1)
  const sortedBlogs = useMemo(
    () => {
      const sortedBlogs = blogs.slice()
      sortedBlogs.sort(byLikes)
      return sortedBlogs
    },
    [blogs]
  )

  const login = async (username, password) => {
    loginService
      .login({
        username,
        password
      })
      .then((user) => {
        setUser(user)
        userService.setUser(user)
        notify(`${user.name} logged in!`)
      })
      .catch(() => {
        notify('wrong username/password', 'alert')
      })
  }

  const logout = () => {
    setUser(null)
    userService.clearUser()
    notify('good bye!')
  }

  const createBlog = async (blog) => {
    await addNewBlog(blog)

    if (isPostError) {
      notify('creating a blog failed: ' + postError, 'alert')
      return
    }

    notify(`a new blog '${blog.title}' by ${blog.author} added`)
    blogFormRef.current.toggleVisibility()
  }

  const removeBlog = (id) => {
    const toRemove = blogs.find((b) => b.id === id)

    const ok = window.confirm(
      `remove '${toRemove.title}' by ${toRemove.author}?`
    )

    if (!ok) {
      return
    }

    deleteBlog(id)

    if (isDeleteError) {
      notify('removing the blog failed: ' + deleteError, 'alert')
      return
    }

    notify('blog removed')
  }

  const likeBlog = async (id) => {
    const toLike = blogs.find((b) => b.id === id)
    const liked = {
      ...toLike,
      likes: (toLike.likes || 0) + 1,
      user: toLike.user.id
    }

    await updateBlog(liked)
    notify(`you liked '${liked.title}' by ${liked.author}`)
  }

  const notify = (message, type = 'info') => {
    if (timerId) {
      clearTimeout(timerId)
    }

    dispatch(setNotification({ message: message, type: type }))

    timerId = setTimeout(() => {
      dispatch(resetNotification())
    }, 5000)
  }

  if (user === null) {
    return (
      <div>
        <Notification notification />
        <LoginForm onLogin={login} />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>

      <Notification />

      <div>
        {user.name} logged in
        <button onClick={logout}>logout</button>
      </div>

      <Togglable buttonLabel="new note" ref={blogFormRef}>
        <NewBlogForm onCreate={createBlog} />
      </Togglable>

      <div className="isErrorIsLoading">
        {error && <p>Error fetching data</p>}
        {isLoading && <p>Loading...</p>}
      </div>

      {isSuccess && (
        <div id="blogs">
          {sortedBlogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              likeBlog={likeBlog}
              removeBlog={removeBlog}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
