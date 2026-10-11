import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { CommandDialog } from './components/layout/CommandDialog';
import { ToastContainer, ToastMessage, ToastType } from './components/common/Toast';

// Views
import { DashboardView } from './components/views/DashboardView';
import { LearningHubView } from './components/views/LearningHubView';
import { ClassroomStudentsView } from './components/views/ClassroomStudentsView';
import { LearningMaterialsView } from './components/views/LearningMaterialsView';
import { LessonsAssignmentsView } from './components/views/LessonsAssignmentsView';
import { TestsView } from './components/views/TestsView';
import { MatrixView } from './components/views/MatrixView';
import { SpecificationsView } from './components/views/SpecificationsView';
import { AITestBuilderView } from './components/views/AITestBuilderView';
import { TestTakingView } from './components/views/TestTakingView';
import { AIVerificationLabView } from './components/views/AIVerificationLabView';
import { AutomationBiasLabView } from './components/views/AutomationBiasLabView';
import { VerificationTrainerView } from './components/views/VerificationTrainerView';
import { PrePostAssessmentView } from './components/views/PrePostAssessmentView';
import { ResearchDashboardView } from './components/views/ResearchDashboardView';
import { ResearchNotebookView } from './components/views/ResearchNotebookView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { PromptLibraryView } from './components/views/PromptLibraryView';
import { DataVaultView } from './components/views/DataVaultView';
import { AuditLogView } from './components/views/AuditLogView';
import { SettingsView } from './components/views/SettingsView';

import { StorageService } from './services/storage';
import { Role, LearningMaterial } from './types';
import { arrayToCSV, downloadFile } from './utils/exportImport';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [currentRole, setCurrentRole] = useState<Role>('teacher');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global settings state
  const [settings, setSettings] = useState(StorageService.getSettings());
  const [anonymize, setAnonymize] = useState(settings.anonymizeData);
  const [darkMode, setDarkMode] = useState(settings.theme === 'dark');

  // Autosave label
  const [lastSavedText, setLastSavedText] = useState('Đã lưu tự động');

  // Active student for student view simulation
  const [activeStudentId, setActiveStudentId] = useState<string>('std-001');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data State
  const [students, setStudents] = useState(StorageService.getStudents());
  const [classrooms, setClassrooms] = useState(StorageService.getClassrooms());
  const [materials, setMaterials] = useState(StorageService.getMaterials());
  const [lessons, setLessons] = useState(StorageService.getLessons());
  const [assignments, setAssignments] = useState(StorageService.getAssignments());
  const [submissions, setSubmissions] = useState(StorageService.getSubmissions());
  const [questions, setQuestions] = useState(StorageService.getQuestions());
  const [matrices, setMatrices] = useState(StorageService.getMatrices());
  const [specs, setSpecs] = useState(StorageService.getSpecs());
  const [tests, setTests] = useState(StorageService.getTests());
  const [verificationTasks, setVerificationTasks] = useState(StorageService.getVerificationTasks());
  const [verificationSubs, setVerificationSubs] = useState(StorageService.getVerificationSubmissions());
  const [prePost, setPrePost] = useState(StorageService.getPrePost());
  const [notebook, setNotebook] = useState(StorageService.getNotebook());
  const [prompts, setPrompts] = useState(StorageService.getPrompts());
  const [logs, setLogs] = useState(StorageService.getLogs());

  // Material preview modal
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  // Refresh all state from storage
  const refreshData = useCallback(() => {
    setStudents(StorageService.getStudents());
    setClassrooms(StorageService.getClassrooms());
    setMaterials(StorageService.getMaterials());
    setLessons(StorageService.getLessons());
    setAssignments(StorageService.getAssignments());
    setSubmissions(StorageService.getSubmissions());
    setQuestions(StorageService.getQuestions());
    setMatrices(StorageService.getMatrices());
    setSpecs(StorageService.getSpecs());
    setTests(StorageService.getTests());
    setVerificationTasks(StorageService.getVerificationTasks());
    setVerificationSubs(StorageService.getVerificationSubmissions());
    setPrePost(StorageService.getPrePost());
    setNotebook(StorageService.getNotebook());
    setPrompts(StorageService.getPrompts());
    setLogs(StorageService.getLogs());
    setSettings(StorageService.getSettings());

    const now = new Date();
    setLastSavedText(`Đã lưu lúc ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
  }, []);

  // Show Toast
  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `t-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Theme synchronization
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Quick Export
  const handleQuickExport = () => {
    const data = verificationSubs.map((s) => ({
      Trial_ID: s.id,
      Participant: anonymize ? s.studentId : s.studentName,
      Condition: s.condition,
      Task: s.taskTitle,
      Initial_Decision: s.initialDecision,
      Initial_Duration_Sec: s.initialDecisionDurationSec,
      Total_Verification_Sec: s.verificationDurationSec,
      Evidence_Cited: s.selectedEvidence ? 'YES' : 'NO',
      Final_Decision: s.finalDecision,
      Confidence: s.confidence,
      AI_Error_Accepted: s.isAiErrorAccepted ? 'YES' : 'NO',
      Correct_Decision: s.isCorrectDecision ? 'YES' : 'NO',
      Timestamp: s.submittedAt,
    }));
    const csv = arrayToCSV(data);
    downloadFile(`AutoBiasEd_QuickExport_${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
    showToast('success', 'Xuất dữ liệu', `Đã tải xuống tập dữ liệu ${data.length} dòng.`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Command Dialog */}
      <CommandDialog
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsCommandOpen(false);
        }}
        onAction={(actionId) => {
          if (actionId === 'open-command') setIsCommandOpen(true);
        }}
      />

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          students={students}
          activeStudentId={activeStudentId}
          onSelectActiveStudent={setActiveStudentId}
          anonymize={anonymize}
          onAnonymizeToggle={() => {
            const next = !anonymize;
            setAnonymize(next);
            showToast('info', next ? 'Đã bật ẩn danh' : 'Đã tắt ẩn danh', 'Chế độ hiển thị mã định danh khách thể nghiên cứu.');
          }}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode(!darkMode)}
          onOpenCommand={() => setIsCommandOpen(true)}
          onQuickExport={handleQuickExport}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          lastSavedText={lastSavedText}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentRole={currentRole}
              students={students}
              classrooms={classrooms}
              materials={materials}
              lessons={lessons}
              assignments={assignments}
              submissions={submissions}
              tests={tests}
              verificationTasks={verificationTasks}
              verificationSubmissions={verificationSubs}
              prePost={prePost}
              anonymize={anonymize}
              activeStudentId={activeStudentId}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'learning-hub' && (
            <LearningHubView
              currentRole={currentRole}
              lessons={lessons}
              materials={materials}
              assignments={assignments}
              submissions={submissions}
              tests={tests}
              verificationTasks={verificationTasks}
              onNavigate={setCurrentTab}
              onOpenTest={() => setCurrentTab('test-taking')}
              onOpenVerification={() => setCurrentTab('ai-verification')}
              onOpenMaterial={(mat) => setPreviewMaterial(mat)}
            />
          )}

          {(currentTab === 'classrooms' || currentTab === 'students') && (
            <ClassroomStudentsView
              students={students}
              classrooms={classrooms}
              submissions={submissions}
              verificationSubs={verificationSubs}
              prePost={prePost}
              anonymize={anonymize}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'materials' && (
            <LearningMaterialsView
              currentRole={currentRole}
              materials={materials}
              lessons={lessons}
              tests={tests}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {(currentTab === 'lessons' || currentTab === 'assignments') && (
            <LessonsAssignmentsView
              currentRole={currentRole}
              lessons={lessons}
              assignments={assignments}
              submissions={submissions}
              students={students}
              classrooms={classrooms}
              materials={materials}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'tests' && (
            <TestsView
              currentRole={currentRole}
              tests={tests}
              matrices={matrices}
              specs={specs}
              questions={questions}
              onRefresh={refreshData}
              onShowToast={showToast}
              onOpenTestTaking={(testId) => setCurrentTab('test-taking')}
              onOpenTestBuilder={(testId) => setCurrentTab('test-builder')}
              onOpenMatrix={() => setCurrentTab('matrix')}
              onOpenSpecs={() => setCurrentTab('specs')}
            />
          )}

          {currentTab === 'matrix' && (
            <MatrixView
              currentRole={currentRole}
              matrices={matrices}
              onRefresh={refreshData}
              onShowToast={showToast}
              onNavigateToSpec={() => setCurrentTab('specs')}
              onNavigateToTests={() => setCurrentTab('tests')}
            />
          )}

          {currentTab === 'specs' && (
            <SpecificationsView
              currentRole={currentRole}
              specs={specs}
              matrices={matrices}
              onRefresh={refreshData}
              onShowToast={showToast}
              onNavigateToTests={() => setCurrentTab('tests')}
            />
          )}

          {currentTab === 'test-builder' && (
            <AITestBuilderView
              currentRole={currentRole}
              tests={tests}
              questions={questions}
              matrices={matrices}
              specs={specs}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'test-taking' && (
            <TestTakingView
              currentRole={currentRole}
              tests={tests}
              students={students}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'ai-verification' && (
            <AIVerificationLabView
              currentRole={currentRole}
              tasks={verificationTasks}
              submissions={verificationSubs}
              students={students}
              materials={materials}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'automation-bias' && (
            <AutomationBiasLabView
              currentRole={currentRole}
              tasks={verificationTasks}
              submissions={verificationSubs}
              students={students}
              settings={settings}
              anonymize={anonymize}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'verification-trainer' && (
            <VerificationTrainerView
              currentRole={currentRole}
              tasks={verificationTasks}
              students={students}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'pre-post' && (
            <PrePostAssessmentView
              currentRole={currentRole}
              prePost={prePost}
              students={students}
              anonymize={anonymize}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'research-dashboard' && (
            <ResearchDashboardView
              currentRole={currentRole}
              submissions={verificationSubs}
              prePost={prePost}
              students={students}
              settings={settings}
              anonymize={anonymize}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'research-notebook' && (
            <ResearchNotebookView
              currentRole={currentRole}
              notebook={notebook}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistantView currentRole={currentRole} />
          )}

          {currentTab === 'prompts' && (
            <PromptLibraryView
              currentRole={currentRole}
              prompts={prompts}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'data-vault' && (
            <DataVaultView
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'audit-log' && (
            <AuditLogView
              currentRole={currentRole}
              logs={logs}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentRole={currentRole}
              settings={settings}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}
