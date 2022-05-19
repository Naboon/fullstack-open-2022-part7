import PropTypes from 'prop-types'
import { Link as RouterLink } from 'react-router-dom'
import {
  Link,
  Typography,
  Button,
  List,
  ListItem,
  Divider
} from '@mui/material'

export const BlogDetails = ({ blog, likeBlog, removeBlog, user }) => {
  if (!blog) {
    return null
  }

  const addedBy = blog.user && blog.user.name ? blog.user.name : 'anonymous'

  return (
    <div>
      <Typography variant="h4">
        {blog.title} by {blog.author}
      </Typography>
      <Link href={blog.url}>{blog.url}</Link>
      <div>
        {blog.likes} likes{' '}
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => likeBlog(blog.id)}
        >
          like
        </Button>
      </div>
      added by {addedBy}
      {user.username === blog.user.username && (
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => removeBlog(blog.id)}
        >
          remove
        </Button>
      )}
      <Divider />
      <Typography variant="h5">comments</Typography>
      <List>
        {blog.comments.map((comment) => {
          return <ListItem key={comment}>{comment}</ListItem>
        })}
      </List>
    </div>
  )
}

const Blog = ({ blog }) => {
  return (
    <div className="blog">
      <Link component={RouterLink} to={`/blogs/${blog.id}`}>
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
    comments: PropTypes.array.isRequired,
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
