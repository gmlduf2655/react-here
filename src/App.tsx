import { useEffect, useState } from 'react';
import { Home, Settings, Users, FileText, Grid3x3, BarChart3, Mail, NotebookText, Map, Clock } from 'lucide-react';
//import { LoginPage } from '@/components/LoginPage';
import { LoginPage } from './login/LoginPage.tsx';
import { SignupPage } from './signUp/SignUpPage.tsx';
import { MemoPage } from './memo/MemoPage.tsx';
import { MindMapPage } from './mindMap/MindMapPage.tsx';
import { MandalartPage } from './mandalart/MandalartPage.tsx';
import { Header } from './frame/Header.jsx';
import { SideBar } from './frame/SideBar.jsx';
import { Footer } from './frame/Footer.jsx';
import { TimeBoxPage } from './timeBox/timeBoxPage.js';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('home');
  const [activeTopMenu, setActiveTopMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // 다크 모드 토글 시 localStorage 저장 및 클래스 적용
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);  

  const menuItems = [
    { id: 'home', label: '홈', icon: Home },
    /*
    { id: 'users', label: '사용자', icon: Users },
    { id: 'documents', label: '문서', icon: FileText },
    { id: 'analytics', label: '분석', icon: BarChart3 },
    { id: 'messages', label: '메시지', icon: Mail },
    */
    { id: 'memos', label: '메모장', icon: NotebookText },
    { id: 'mindMap', label: '마인드맵', icon: Map },
    { id: 'mandalart', label: '만다라트', icon: Grid3x3 },
    { id: 'timebox', label: 'TimeBox', icon: Clock },
    //{ id: 'settings', label: '설정', icon: Settings },
  ];

  const topMenuItems = [
    { id: 'dashboard', label: '메모' },
    /*
    { id: 'projects', label: '프로젝트' },
    { id: 'team', label: '팀' },
    { id: 'reports', label: '리포트' },
    */
  ];
  useEffect(() => {
    // 초기 로그인 상태 확인 (예: 로컬 스토리지에서 토큰 확인)
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인하지 않은 경우 로그인 페이지 표시
  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <SignupPage 
          onSignupSuccess={() => {
            //setIsLoggedIn(true);
            setShowSignup(false);
          }}
          onSwitchToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <LoginPage 
        onLoginSuccess={() => setIsLoggedIn(true)}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  } 

  const pageComponents = {
    memos: <MemoPage />,
    mindMap: <MindMapPage />,
    mandalart: <MandalartPage />,
    timebox: <TimeBoxPage />,
  };

  const DefaultPage = () => (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl mb-2 dark:text-white">
          {menuItems.find((item) => item.id === activeMenu)?.label}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {activeMenu} 페이지에 오신 것을 환영합니다
        </p>
      </div>

      {/* 콘텐츠 카드 예시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div
            key={num}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg mb-2 dark:text-white">콘텐츠 카드 {num}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              이곳에 {activeMenu} 관련 콘텐츠가 표시됩니다.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                자세히 보기 →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="size-full flex flex-col h-dvh">
      {/* 상단 헤더 */}
      <Header
        activeTopMenu={activeTopMenu}
        setActiveTopMenu={setActiveTopMenu}
        topMenuItems={topMenuItems}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* 메인 레이아웃 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 */}
        <SideBar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          menuItems={menuItems}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* 오른쪽 메인 콘텐츠 */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <div className="h-full p-8">
            {pageComponents[activeMenu as keyof typeof pageComponents] ?? <DefaultPage />}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}