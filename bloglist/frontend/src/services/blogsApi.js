/* eslint-disable indent */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import userService from './user'

const byLikes = (b1, b2) => (b2.likes > b1.likes ? 1 : -1)

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    tagTypes: ['Blogs', 'Users'],
    prepareHeaders: (headers) => {
      const token = userService.getToken()

      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      return headers
    }
  }),
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: () => '/blogs',
      transformResponse: (response) => response.sort(byLikes),
      providesTags: ['Blogs']
    }),
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users']
    }),
    addNewBlog: builder.mutation({
      query: (newBlog) => ({
        url: '/blogs',
        method: 'POST',
        body: newBlog
      }),
      invalidatesTags: ['Blogs']
    }),
    removeBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Blogs']
    }),
    updateBlog: builder.mutation({
      query: (updatedBlog) => ({
        url: `/blogs/${updatedBlog.id}`,
        method: 'PUT',
        body: updatedBlog
      }),
      invalidatesTags: ['Blogs']
    })
  })
})

export const {
  useGetBlogsQuery,
  useGetUsersQuery,
  useAddNewBlogMutation,
  useRemoveBlogMutation,
  useUpdateBlogMutation
} = blogsApi
