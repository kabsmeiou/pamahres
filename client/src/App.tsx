import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import Course from './pages/Course'
import CreateCourse from './pages/CreateCourse'
import Materials from './pages/Materials'
import Quizzes from './pages/Quizzes'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import CourseLayout from './components/CourseLayout'
import NotFound from './pages/NotFound'
import QuizPage from './pages/QuizPage/QuizPage'

function App() {
  return (
    <BrowserRouter>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="settings" element={<Settings />} />

            <Route path="courses/:courseId" element={<CourseLayout />}>
              <Route index element={<Course />} />
              <Route path="materials" element={<Materials />} />
              <Route path="quizzes" element={<Quizzes />} />
            </Route>
            <Route path="courses/:courseId/quizzes/:quizId" element={<QuizPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </BrowserRouter>
  )
}

export default App
