const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Chinese Cuisine',
    author: 'Lizzy Smith',
    url: 'http://foodblogs.com/lizzyschinesecuisine',
    likes: 572
  },
  {
    title: 'All About Fish',
    author: 'Gerhard Manning',
    url: 'http://kitchentrends.com/allaboutfish',
    likes: 882
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb
}