import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  tagTypes: ["Faculty", "Student", "Course"],
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // --- New Endpoints ---
    getFacultyList: builder.query({
      query: () => "/admin/faculty",
      providesTags: ["Faculty"], // Tag this data
    }),

    addFaculty: builder.mutation({
      query: (data) => ({
        url: "/admin/faculty",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Faculty"], // Refresh the list after adding
    }),

    getBranches: builder.query({
      query: () => "/admin/branches",
    }),

    getStudents: builder.query({
      query: () => "/admin/students",
      providesTags: ["Student"],
    }),

    addStudent: builder.mutation({
      query: (data) => ({
        url: "/admin/students",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Student"],
    }),

    getCourses: builder.query({
      query: () => "/admin/courses",
      providesTags: ["Course"],
    }),

    addCourse: builder.mutation({
      query: (data) => ({
        url: "/admin/courses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),

    getFacultyCourses: builder.query({
      query: () => "/faculty/courses",
      providesTags: ["Course"],
    }),

    getCourseStudents: builder.query({
      query: ({ courseId, date }) =>
        `/faculty/course/${courseId}/students?date=${date}`,
      providesTags: ["Attendance"], // Refreshes when attendance is marked
    }),

    markAttendance: builder.mutation({
      query: (data) => ({
        url: "/faculty/attendance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getStudentDashboard: builder.query({
      query: () => "/student/dashboard",
      providesTags: ["Attendance"], // Updates if attendance changes
    }),

    getAdminStats: builder.query({
      query: () => "/admin/stats",
      providesTags: ["Student", "Faculty", "Course"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetFacultyListQuery,
  useAddFacultyMutation,
  useGetBranchesQuery,
  useGetStudentsQuery,
  useAddStudentMutation,
  useGetCoursesQuery,
  useAddCourseMutation,
  useGetFacultyCoursesQuery,
  useGetCourseStudentsQuery,
  useMarkAttendanceMutation,
  useGetStudentDashboardQuery,
  useGetAdminStatsQuery,
} = apiSlice;
