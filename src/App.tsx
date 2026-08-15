import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'

import Home from '@/pages/public/Home'
import Quran from '@/pages/public/Quran'
import Hadith from '@/pages/public/Hadith'
import Adhkar from '@/pages/public/Adhkar'
import Lectures from '@/pages/public/Lectures'
import Questions from '@/pages/public/Questions'
import QuestionDetail from '@/pages/public/QuestionDetail'
import About from '@/pages/public/About'
import Contact from '@/pages/public/Contact'
import NotFound from '@/pages/public/NotFound'

import Login from '@/pages/admin/Login'
import Dashboard from '@/pages/admin/Dashboard'
import QuranAdmin from '@/pages/admin/QuranAdmin'
import HadithAdmin from '@/pages/admin/HadithAdmin'
import AdhkarAdmin from '@/pages/admin/AdhkarAdmin'
import LecturesAdmin from '@/pages/admin/LecturesAdmin'
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
        <Route path="/quran" element={<Quran />} />
        <Route path="/hadith" element={<Hadith />} />
        <Route path="/adhkar" element={<Adhkar />} />
        <Route path="/lectures" element={<Lectures />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
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
        <Route path="quran" element={<QuranAdmin />} />
        <Route path="hadith" element={<HadithAdmin />} />
        <Route path="adhkar" element={<AdhkarAdmin />} />
        <Route path="lectures" element={<LecturesAdmin />} />
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
