import { useState, useEffect, useRef } from 'react'

import Blog, { BlogDetails } from './components/Blog'
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

import {
  Routes,
  Route,
  Link,
  useMatch,
  Navigate,
  useNavigate
} from 'react-router-dom'

const App = () => {
  const navigate = useNavigate()

  const Blogs = ({ blogFormRef }) => {
    return (
      <div>
        <Togglable buttonLabel="create new" ref={blogFormRef}>
          <NewBlogForm onCreate={createBlog} />
        </Togglable>

        <div className="isErrorIsLoading">
          {error && <p>Error fetching data</p>}
          {isLoading && <p>Loading...</p>}
        </div>

        {isSuccess && (
          <div id="blogs">
            {blogs.map((blog) => <Blog key={blog.id} blog={blog} />)}
          </div>
        )}
      </div>
    )
  }

  const Users = () => {
    const userList = users.map((user) => ({
      name: user.name,
      blogs: user.blogs.length,
      id: user.id
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
                    <tr key={user.id}>
                      <td>
                        <Link to={`/users/${user.id}`}>{user.name}</Link>
                      </td>
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

  const User = ({ user }) => {
    if (!user) {
      return null
    }

    return (
      <div>
        <div className="isErrorIsLoading">
          {usersError && <p>Error fetching data</p>}
          {usersLoading && <p>Loading...</p>}
        </div>

        {userSuccess && (
          <div>
            <h2>{user.name}</h2>
            <h3>added blogs</h3>
            <ul>
              {user.blogs.map((blog) => {
                return <li key={blog.id}>{blog.title}</li>
              })}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const NavBar = () => {
    const navBarStyle = {
      background: '#aaadab'
    }

    const linkStyle = {
      padding: 5
    }

    return (
      <div style={navBarStyle}>
        <Link style={linkStyle} to="/">
          blogs
        </Link>
        <Link style={linkStyle} to="/users">
          users
        </Link>
        {user.name} logged in
        <button onClick={logout}>logout</button>
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

    navigate('/')
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

  const userMatch = useMatch('/users/:id')
  const userById = userMatch
    ? users.find((user) => user.id === userMatch.params.id)
    : null

  const blogMatch = useMatch('/blogs/:id')
  const blogById = blogMatch
    ? blogs.find((blog) => blog.id === blogMatch.params.id)
    : null

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
      <NavBar />

      <h2>blogs</h2>
      <Notification />

      <Routes>
        <Route
          path="/blogs/:id"
          element={
            <BlogDetails
              blog={blogById}
              likeBlog={likeBlog}
              removeBlog={removeBlog}
              user={user}
            />
          }
        />
        <Route path="/blogs" element={<Navigate replace to="/" />} />
        <Route path="/users/:id" element={<User user={userById} />} />
        <Route path="/users" element={<Users />} />
        <Route
          path="/"
          element={<Blogs blogFormRef={blogFormRef} user={user} />}
        />
      </Routes>
    </div>
  )
}

export default App
