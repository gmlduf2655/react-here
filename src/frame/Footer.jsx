export function Footer() {
    return (
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2026 MyApp. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">개인정보처리방침</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">이용약관</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">쿠키정책</a>
          </div>
        </div>
      </footer>
    );
}
