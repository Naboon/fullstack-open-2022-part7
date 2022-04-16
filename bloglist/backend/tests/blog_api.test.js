const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
const Blog = require('../models/blog')

const getUserToken = async () => {
  const user = {
    username: 'root',
    password: 'sekret'
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)

  return response.body.token
}

beforeEach(async () => {

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()

  const users = await helper.usersInDb()
  const userId = users[0].id

  await Blog.deleteMany({})
  const blogs = helper.initialBlogs
  blogs.forEach(b => b.user = userId)
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are initial blogs saved', () => {
  test('blogs are returned as json with a status code 200', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs have an identificator field called "id"', async () => {
    const response = await api.get('/api/blogs')

    const ids = response.body.map(r => r.id)

    expect(ids).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('succeeds with status code 201', async () => {
    const token = await getUserToken()

    const newBlog = {
      title: 'How to Create a Blog',
      author: 'Ricardo Gonzales',
      url: 'http://techtoday.com/guides/blog',
      likes: 1644
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'How to Create a Blog'
    )
  })

  test('fails with status code 401 if no token is given', async () => {
    const newBlog = {
      title: 'How to Create a Blog',
      author: 'Ricardo Gonzales',
      url: 'http://techtoday.com/guides/blog',
      likes: 1644
    }

    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('invalid token')

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('without value for likes is assigned 0 likes', async () => {
    const token = await getUserToken()

    const newBlog = {
      title: 'A Lonely Person',
      author: 'Alfred Kwak',
      url: 'http://everydayproblems.com/blogs/loneliness',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toEqual(0)
  })

  test('fails with status code 400 if title is not assigned', async () => {
    const token = await getUserToken()

    const newBlog = {
      author: 'Fred Goodman',
      url: 'http://blogverse.com/blogs',
      likes: 254
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with status code 400 if url is not assigned', async () => {
    const token = await getUserToken()

    const newBlog = {
      title: 'Travelling Madman',
      author: 'Saul Simpson',
      likes: 775
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const token = await getUserToken()

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('with a new value for title succeeds with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      title: 'Surprice'
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(blogsAtEnd[0].title).toEqual(updatedBlog.title)
  })

  test('with a new value for author succeeds with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      author: 'Kenneth Hamilton'
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(blogsAtEnd[0].author).toEqual(updatedBlog.author)
  })

  test('with a new value for url succeeds with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      url: 'http://foodblogs.com/kennethsasianadventures'
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(blogsAtEnd[0].url).toEqual(updatedBlog.url)
  })

  test('with a new value for likes succeeds with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
      likes: 1533
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(blogsAtEnd[0].likes).toEqual(updatedBlog.likes)
  })
})

describe('when there is initially one user at db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ml',
      name: 'Matti Luukkainen',
      password: 'supersekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be at least 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Matti Luukkainen',
      password: 'supersekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'pw',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password must be at least 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password is required')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})