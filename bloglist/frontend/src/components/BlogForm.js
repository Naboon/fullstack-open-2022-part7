import { useState } from 'react'

const BlogForm = ({ handleAddBlog }) => {
  const [ newTitle, setNewTitle ] = useState('')
  const [ newAuthor, setNewAuthor ] = useState('')
  const [ newUrl, setNewUrl ] = useState('')

  const handleTitleChange = (event) => {
    setNewTitle(event.target.value)
  }

  const handleAuthorChange = (event) => {
    setNewAuthor(event.target.value)
  }

  const handleUrlChange = (event) => {
    setNewUrl(event.target.value)
  }

  const createBlog = (event) => {
    event.preventDefault()
    handleAddBlog({
      title: newTitle,
      author: newAuthor,
      url: newUrl
    })

    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return (
    <div className="formDiv">
      <form onSubmit={createBlog}>
        <div>
          title:
          <input value={newTitle} onChange={handleTitleChange} id="title-input" />
        </div>
        <div>
          author:
          <input value={newAuthor} onChange={handleAuthorChange} id="author-input" />
        </div>
        <div>
          url:
          <input value={newUrl} onChange={handleUrlChange} id="url-input" />
        </div>
        <div>
          <button id="create-button" type="submit">
            create
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogForm
