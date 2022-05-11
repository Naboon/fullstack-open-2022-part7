/* eslint-disable indent */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import userService from './user'

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    tagTypes: ['Blogs'],
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
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Blogs', id })),
              { type: 'Blogs', id: 'LIST' }
            ]
          : [{ type: 'Blogs', id: 'LIST' }]
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
      invalidatesTags: [{ type: 'Blogs', id: 'LIST' }]
    }),
    updateBlog: builder.mutation({
      query: (updatedBlog) => ({
        url: `/blogs/${updatedBlog.id}`,
        method: 'PUT',
        body: updatedBlog
      }),
      invalidatesTags: [{ type: 'Blogs', id: 'LIST' }]
    })
  })
})

export const {
  useGetBlogsQuery,
  useAddNewBlogMutation,
  useRemoveBlogMutation,
  useUpdateBlogMutation
} = blogsApi
