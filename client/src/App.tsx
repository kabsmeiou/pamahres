import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import QuickCreate from "./pages/QuickCreate"
import CourseChat from "./pages/CourseTabs/CourseChat"
import ChatHistoryView from "./pages/ChatHistoryView/ChatHistoryView"
import ChatHistoryIndex from "./pages/ChatHistoryView/ChatHistoryIndex"
import CreateCourse from "./pages/CreateCourse"
import Materials from "./pages/CourseTabs/Materials"
import ChatHistory from "./pages/CourseTabs/ChatHistory"
import Quizzes from "./pages/CourseTabs/Quizzes"
import Settings from "./pages/Settings"
import Layout from "./components/Layout"
import CourseLayout from "./components/CourseLayout"
import NotFound from "./pages/NotFound"
import QuizPage from "./pages/QuizView/QuizPage"
import { ThemeProvider } from "./components/ThemeProvider"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <BrowserRouter>
        {/* Routes requiring authentication */}
        <SignedIn>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quick-create" element={<QuickCreate />} />
            <Route path="/pamahres" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="settings" element={<Settings />} />

              <Route path="courses/:courseId" element={<CourseLayout />}>
                <Route index element={<CourseChat />} />
                <Route path="chat-history" element={<ChatHistory />}>
                  <Route index element={<ChatHistoryIndex />} />
                  <Route path=":chatId" element={<ChatHistoryView />} />
                </Route>
                <Route path="materials" element={<Materials />} />
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="quizzes/:quizId" element={<QuizPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </SignedIn>

        <SignedOut>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<RedirectToSignIn />} />
          </Routes>
        </SignedOut>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
