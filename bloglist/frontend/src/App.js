import { useState, useEffect, useRef } from 'react'

import Blog from './components/Blog'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'

import blogService from './services/blogs'
import loginService from './services/login'
import BlogForm from './components/BlogForm'

const App = () => {
  const [ blogs, setBlogs ] = useState([])
  const [ username, setUsername ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ message, setMessage ] = useState(null)
  const [ messageType, setMessageType ] = useState(null)
  const [ user, setUser ] = useState(null)

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs.sort((a, b) => b.likes - a.likes)))
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password
      })

      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setMessage(`logged in as ${user.name}`)
      setMessageType('notification')
      setTimeout(() => {
        setMessage(null)
        setMessageType(null)
      }, 5000)
    } catch (exception) {
      setMessage('wrong username or password')
      setMessageType('error')
      setTimeout(() => {
        setMessage(null)
        setMessageType(null)
      }, 5000)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.clear()
    setUser(null)
    setMessage('logged out')
    setMessageType('notification')
    setTimeout(() => {
      setMessage(null)
      setMessageType(null)
    }, 5000)
  }

  const handleAddLike = async (id) => {
    const blogObject = blogs.find((n) => n.id === id)
    const changedBlog = { ...blogObject, likes: blogObject.likes + 1 }

    try {
      await blogService.update(id, changedBlog)
      setBlogs(blogs.map((blog) => (blog.id !== id ? blog : changedBlog)).sort((a, b) => b.likes - a.likes))
    } catch (exception) {
      setMessage('adding a like failed')
      setMessageType('error')
      setTimeout(() => {
        setMessage(null)
        setMessageType(null)
      }, 5000)
    }
  }

  const handleAddBlog = async (blogObject) => {
    const newBlog = {
      title: blogObject.title,
      author: blogObject.author,
      url: blogObject.url,
      likes: 0,
      user: {
        username: user.username,
        name: user.name,
        id: user.id
      }
    }

    try {
      await blogService.create(newBlog)
      const updatedBlogs = await blogService.getAll()
      setBlogs(updatedBlogs.sort((a, b) => b.likes - a.likes))
      setMessage(`a new blog ${newBlog.title} by ${newBlog.author} added`)
      setMessageType('notification')
      setTimeout(() => {
        setMessage(null)
        setMessageType(null)
      }, 5000)
    } catch (exception) {
      setMessage('invalid blog information, title and author are required')
      setMessageType('error')
      setTimeout(() => {
        setMessage(null)
        setMessageType(null)
      }, 5000)
    }
  }

  const handleRemoveBlog = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter((n) => n.id !== blog.id))
      } catch (exception) {
        setMessage('could not remove the blog, only the user who added the blog can remove it')
        setMessageType('error')
        setTimeout(() => {
          setMessage(null)
          setMessageType(null)
        }, 5000)
      }
    }
  }

  const blogFormRef = useRef()

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={message} type={messageType} />

        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleSubmit={handleLogin}
        />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message} type={messageType} />

      <p>
        {user.name} logged in
        <button id="logout-button" onClick={handleLogout}>
          logout
        </button>
      </p>

      <h2>create new</h2>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm handleAddBlog={handleAddBlog} />
      </Togglable>
      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          user={user}
          handleAddLike={() => handleAddLike(blog.id)}
          handleRemoveBlog={() => handleRemoveBlog(blog)}
        />
      ))}
    </div>
  )
}

export default App
