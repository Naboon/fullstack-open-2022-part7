import { useState, useEffect, useRef } from 'react'

import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import NewBlogForm from './components/NewBlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

import loginService from './services/login'
import userService from './services/user'

import {
  useGetBlogsQuery,
  useGetUsersQuery,
  useAddNewBlogMutation,
  useRemoveBlogMutation,
  useUpdateBlogMutation
} from './services/blogsApi'

import { useDispatch } from 'react-redux'
import {
  setNotification,
  resetNotification
} from './reducers/notificationReducer'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  const Blogs = ({ blogFormRef, user }) => {
    return (
      <div>
        <Togglable buttonLabel="new note" ref={blogFormRef}>
          <NewBlogForm onCreate={createBlog} />
        </Togglable>

        <div className="isErrorIsLoading">
          {error && <p>Error fetching data</p>}
          {isLoading && <p>Loading...</p>}
        </div>

        {isSuccess && (
          <div id="blogs">
            {blogs.map((blog) => (
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

  const Users = () => {
    const userList = users.map((user) => ({
      name: user.name,
      blogs: user.blogs.length
    }))

    return (
      <div>
        <h2>Users</h2>

        <div className="isErrorIsLoading">
          {usersError && <p>Error fetching data</p>}
          {usersLoading && <p>Loading...</p>}
        </div>

        {userSuccess && (
          <div id="users">
            <table>
              <tbody>
                <tr>
                  <th />
                  <th>blogs created</th>
                </tr>
                {userList.map((user) => {
                  return (
                    <tr key={user.name}>
                      <td>{user.name}</td>
                      <td>{user.blogs}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  const { data: blogs = [], error, isLoading, isSuccess } = useGetBlogsQuery()
  const {
    data: users = [],
    error: usersError,
    isLoading: usersLoading,
    isSuccess: userSuccess
  } = useGetUsersQuery()

  const [
    addNewBlog,
    { error: postError, isError: isPostError }
  ] = useAddNewBlogMutation()

  const [deleteBlog] = useRemoveBlogMutation()

  const [updateBlog] = useUpdateBlogMutation()

  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    const userFromStorage = userService.getUser()
    if (userFromStorage) {
      setUser(userFromStorage)
    }
  }, [])

  const dispatch = useDispatch()

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
    dispatch(setNotification({ message: message, type: type }))

    setTimeout(() => {
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
        <p>{user.name} logged in</p>
        <button onClick={logout}>logout</button>
      </div>

      <Router>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route
            path="/"
            element={<Blogs blogFormRef={blogFormRef} user={user} />}
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
