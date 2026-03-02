export function Footer() {
    return (
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
    );
}
