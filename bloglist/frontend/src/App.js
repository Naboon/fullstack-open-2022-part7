import { useState, useEffect, useRef } from 'react'

import Blog, { BlogDetails } from './components/Blog'
import LoginForm from './components/LoginForm'
import NewBlogForm from './components/NewBlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

import loginService from './services/login'
import userService from './services/user'

import {
  Container,
  Link,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import Paper from '@mui/material/Paper'

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
  Link as RouterLink,
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
          <NewBlogForm onCreate={createBlog} notify={notify} />
        </Togglable>

        <div className="isErrorIsLoading">
          {error && <p>Error fetching data</p>}
          {isLoading && <p>Loading...</p>}
        </div>

        {isSuccess && (
          // <Box sx={{ border: '1px solid grey', padding: 5 }}>
          //   <Stack divider={<Divider flexItem />} spacing={2}>
          //     {blogs.map((blog) => <Blog key={blog.id} blog={blog} />)}
          //   </Stack>
          // </Box>
          <TableContainer component={Paper} sx={{ background: '#b8cef2' }}>
            <Table>
              <TableBody>
                {blogs.map((blog) => {
                  return (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <Blog blog={blog} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
        <Typography variant="h4">Users</Typography>

        <div className="isErrorIsLoading">
          {usersError && <p>Error fetching data</p>}
          {usersLoading && <p>Loading...</p>}
        </div>

        {userSuccess && (
          <div id="users">
            <TableContainer component={Paper} sx={{ background: '#b8cef2' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>blogs created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userList.map((user) => {
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Link component={RouterLink} to={`/users/${user.id}`}>
                            {user.name}
                          </Link>
                        </TableCell>
                        <TableCell>{user.blogs}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4">Blog App</Typography>
          <Button
            sx={{ margin: 1 }}
            color="inherit"
            component={RouterLink}
            to="/"
          >
            blogs
          </Button>
          <Button
            sx={{ margin: 1 }}
            color="inherit"
            component={RouterLink}
            to="/users"
          >
            users
          </Button>
          {user.name} logged in
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    )
  }

  const { data: blogs = [], error, isLoading, isSuccess } = useGetBlogsQuery()
  const {
    data: users = [],
    error: usersError,
    isLoading: usersLoading,
    isSuccess: userSuccess
  } = useGetUsersQuery()

  const [addNewBlog] = useAddNewBlogMutation()
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
        navigate('/')
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
      <Container>
        <div>
          <Notification notification />
          <LoginForm onLogin={login} />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div>
        <NavBar />

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
    </Container>
  )
}

export default App
