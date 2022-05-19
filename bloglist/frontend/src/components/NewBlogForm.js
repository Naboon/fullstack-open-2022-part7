import { useState } from 'react'

import { TextField, Button, Typography } from '@mui/material'

const NewBlogForm = ({ onCreate, notify }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!title || !author || !url) {
      notify('fill out all fields before submitting', 'alert')
      return
    }

    onCreate({ title, author, url, likes: 0 })
    setAuthor('')
    setTitle('')
    setUrl('')
  }

  return (
    <div>
      <Typography variant="h3">Create new blog</Typography>

      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            id="title"
            sx={{ width: '360px' }}
            label="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          <TextField
            id="author"
            sx={{ width: '360px' }}
            label="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          <TextField
            id="url"
            sx={{ width: '360px' }}
            label="URL"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <Button
          id="create-button"
          sx={{ width: '90px' }}
          variant="outlined"
          color="primary"
          type="submit"
        >
          create
        </Button>
      </form>
    </div>
  )
}

export default NewBlogForm
