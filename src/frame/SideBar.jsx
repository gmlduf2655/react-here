import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SideBar({ isSidebarCollapsed, setIsSidebarCollapsed, menuItems, activeMenu, setActiveMenu }) {
    return (
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white flex flex-col transition-all duration-300 relative border-r border-gray-700 dark:border-gray-600`}>
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h1 className={`text-xl transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>사이드 메뉴</h1>
                <button
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                    {isSidebarCollapsed
                        ? <ChevronRight className="size-5 text-gray-300" />
                        : <ChevronLeft className="size-5 text-gray-300" />
                    }
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
                                    <span className={`transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
