const _ = require('lodash')
// const dummy = (blogs) => {
//   return 1
// }

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return Object.keys(blogs).length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (Object.keys(blogs).length === 0) {
    return {}
  }

  const reducer = (max, blog) => {
    return max.likes > blog.likes
      ? max
      : blog
  }

  let favoriteBlog = blogs.reduce(reducer, {})

  return {
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: favoriteBlog.likes
  }
}

const mostBlogs = (blogs) => {
  if (Object.keys(blogs).length === 0) {
    return {}
  }

  const authorBlogs = _.map(
    _.countBy(blogs, 'author'), (val, key) => {
      return { author: key, blogs: val }
    }
  )

  const reducer = (max, author) => {
    return max.blogs > author.blogs
      ? max
      : author
  }

  return authorBlogs.reduce(reducer, {})
}

const mostLikes = (blogs) => {
  if (Object.keys(blogs).length === 0) {
    return {}
  }

  const authorLikes = _(blogs)
    .groupBy('author')
    .map((objs, key) => ({
      'author': key,
      'likes': _.sumBy(objs, 'likes') }))
    .value()

  const reducer = (max, author) => {
    return max.likes > author.likes
      ? max
      : author
  }

  return authorLikes.reduce(reducer, {})
}

module.exports = {
  //dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}