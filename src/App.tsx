import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'

import Home from '@/pages/public/Home'
import DailyPrayer from '@/pages/public/DailyPrayer'
import QA from '@/pages/public/QA'
import QuestionDetail from '@/pages/public/QuestionDetail'
import LectureDetail from '@/pages/public/LectureDetail'
import QuizTake from '@/pages/public/QuizTake'
import About from '@/pages/public/About'
import NotFound from '@/pages/public/NotFound'

import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import PostsAdmin from '@/pages/admin/PostsAdmin'
import QuizzesAdmin from '@/pages/admin/QuizzesAdmin'
import LecturesAdmin from '@/pages/admin/LecturesAdmin'
import ResourcesAdmin from '@/pages/admin/ResourcesAdmin'
import QuestionsAdmin from '@/pages/admin/QuestionsAdmin'
import ExecutivesAdmin from '@/pages/admin/ExecutivesAdmin'
import FounderAdmin from '@/pages/admin/FounderAdmin'
import GroupInformationAdmin from '@/pages/admin/GroupInformationAdmin'
import RulesAdmin from '@/pages/admin/RulesAdmin'
import SocialLinksAdmin from '@/pages/admin/SocialLinksAdmin'
import SettingsAdmin from '@/pages/admin/SettingsAdmin'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/daily-prayer" element={<DailyPrayer />} />
        <Route path="/qa" element={<QA />} />
        <Route path="/about" element={<About />} />

        {/* Unlisted, shareable detail pages — not in the main menu */}
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/lectures/:id" element={<LectureDetail />} />
        <Route path="/quizzes/:id" element={<QuizTake />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="posts" element={<PostsAdmin />} />
        <Route path="quizzes" element={<QuizzesAdmin />} />
        <Route path="lectures" element={<LecturesAdmin />} />
        <Route path="resources" element={<ResourcesAdmin />} />
        <Route path="questions" element={<QuestionsAdmin />} />
        <Route path="executives" element={<ExecutivesAdmin />} />
        <Route path="founder" element={<FounderAdmin />} />
        <Route path="group-information" element={<GroupInformationAdmin />} />
        <Route path="rules" element={<RulesAdmin />} />
        <Route path="social-links" element={<SocialLinksAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
