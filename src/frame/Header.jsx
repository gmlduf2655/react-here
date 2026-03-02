import { Search, Bell, ChevronDown, Sun, Moon } from 'lucide-react';

export function Header({ activeTopMenu, setActiveTopMenu, topMenuItems, isDarkMode, setIsDarkMode }) {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
                {/* 로고 & 제목 */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <h1 className="text-xl dark:text-white">MyApp</h1>
                    </div>

                    {/* 대메뉴 */}
                    <nav className="hidden md:flex items-center gap-1">
                        {topMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTopMenu(item.id)}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeTopMenu === item.id
                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                    <div className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <Search className="size-4 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder="검색..."
                            className="bg-transparent border-none outline-none text-sm w-64 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>

                    {/* 다크/라이트 모드 토글 */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                    >
                        {isDarkMode ? (
                            <Sun className="size-5 text-gray-600 dark:text-gray-300" />
                        ) : (
                            <Moon className="size-5 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>

                    {/* 알림 */}
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="size-5 text-gray-600" />
                        <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* 유저 정보 */}
                    <button className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                        <div className="size-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">{sessionStorage.getItem('userName')?.substring(0, 1)}</span>
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-sm">{sessionStorage.getItem('userName')}</div>
                            <div className="text-xs text-gray-500">{sessionStorage.getItem('position')}</div>
                        </div>
                        <ChevronDown className="size-4 text-gray-600" />
                    </button>
                </div>
            </div>
        </header>
    );
}
