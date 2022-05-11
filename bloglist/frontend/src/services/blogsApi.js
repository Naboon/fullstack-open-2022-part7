import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import userService from './user'

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    tagTypes: ['Blog'],
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
      providesTags: ['Blog']
    }),
    addNewBlog: builder.mutation({
      query: (body) => ({
        url: '/blogs',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Blog']
    })
  })
})

export const { useGetBlogsQuery, useAddNewBlogMutation } = blogsApi
