import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<BlogForm /> updates parent state and calls onSubmit', () => {
  const createBlog = jest.fn()

  const { container } = render(<BlogForm handleAddBlog={createBlog} />)

  const titleInput = container.querySelector('#title-input')
  const authorInput = container.querySelector('#author-input')
  const urlInput = container.querySelector('#url-input')
  const createButton = screen.getByText('create')

  userEvent.type(titleInput, 'Test Engineering')
  userEvent.type(authorInput, 'Gerhard Berger')
  userEvent.type(urlInput, 'http://greatblogs.com/gberger/testing')
  userEvent.click(createButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('Test Engineering')
  expect(createBlog.mock.calls[0][0].author).toBe('Gerhard Berger')
  expect(createBlog.mock.calls[0][0].url).toBe('http://greatblogs.com/gberger/testing')
})