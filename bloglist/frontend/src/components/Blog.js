import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export const BlogDetails = ({ blog, likeBlog, removeBlog, user }) => {
  const addedBy = blog.user && blog.user.name ? blog.user.name : 'anonymous'

  return (
    <div>
      <h2>
        {blog.title} {blog.author}
      </h2>
      <div>
        <a href={blog.url}>{blog.url}</a>
      </div>
      <div>
        {blog.likes} likes{' '}
        <button onClick={() => likeBlog(blog.id)}>like</button>
      </div>
      added by {addedBy}
      {user.username === blog.user.username && (
        <button onClick={() => removeBlog(blog.id)}>remove</button>
      )}
    </div>
  )
}

const Blog = ({ blog }) => {
  const style = {
    padding: 3,
    margin: 5,
    borderStyle: 'solid',
    borderWidth: 1
  }

  return (
    <div style={style} className="blog">
      <Link to={`/blogs/${blog.id}`}>
        {blog.title} {blog.author}
      </Link>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  }).isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired
  })
}

export default Blog
