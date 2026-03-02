import { useEffect, useState } from 'react';
import { Home, Settings, Users, FileText, Grid3x3, BarChart3, Mail, Search, Bell, ChevronDown, ChevronLeft, ChevronRight, NotebookText, Map } from 'lucide-react';
//import { LoginPage } from '@/components/LoginPage';
import { LoginPage } from './login/LoginPage.jsx';
import { SignupPage } from './signUp/SignUpPage.jsx';
import { MemoPage } from './memo/MemoPage.jsx';
import { MindMapPage } from './mindMap/MindMapPage.jsx';
import { MandalartPage } from './mandalart/MandalartPage.jsx';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('home');
  const [activeTopMenu, setActiveTopMenu] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

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
  };

  const DefaultPage = () => (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl mb-2">
          {menuItems.find((item) => item.id === activeMenu)?.label}
        </h2>
        <p className="text-gray-600">
          {activeMenu} 페이지에 오신 것을 환영합니다
        </p>
      </div>

      {/* 콘텐츠 카드 예시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div
            key={num}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg mb-2">콘텐츠 카드 {num}</h3>
            <p className="text-gray-600">
              이곳에 {activeMenu} 관련 콘텐츠가 표시됩니다.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-700">
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
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* 로고 & 제목 */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-xl">MyApp</h1>
            </div>

            {/* 대메뉴 */}
            <nav className="hidden md:flex items-center gap-1">
              {topMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTopMenu(item.id)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTopMenu === item.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 검색, 알림, 유저 정보 */}
          <div className="flex items-center gap-4">
            {/* 검색 */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <Search className="size-4 text-gray-500" />
              <input
                type="text"
                placeholder="검색..."
                className="bg-transparent border-none outline-none text-sm w-64"
              />
            </div>

            {/* 알림 */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="size-5 text-gray-600" />
              <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 유저 정보 */}
            <button className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
              <div className="size-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">김</span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm">김철수</div>
                <div className="text-xs text-gray-500">관리자</div>
              </div>
              <ChevronDown className="size-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 */}
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300 relative`}>
          <div className={`p-6 border-b border-gray-700 flex items-center justify-between`}>
            <h1 className={`text-xl transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>사이드 메뉴</h1>
            <button
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <ChevronRight className="size-5 text-gray-300" /> : <ChevronLeft className="size-5 text-gray-300" />}
            </button>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeMenu === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      title={isSidebarCollapsed ? item.label : ''}
                    >
                      <Icon className="size-5 flex-shrink-0" />
                      <span className={`transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* 오른쪽 메인 콘텐츠 */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <div className="h-full p-8">
            {pageComponents[activeMenu] ?? <DefaultPage />}
          </div>
        </main>
      </div>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © 2026 MyApp. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600">개인정보처리방침</a>
            <a href="#" className="hover:text-blue-600">이용약관</a>
            <a href="#" className="hover:text-blue-600">쿠키정책</a>
          </div>
        </div>
      </footer>      
    </div>
  );
}