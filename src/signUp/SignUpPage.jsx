import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

export function SignupPage({ onSignupSuccess, onSwitchToLogin }) {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    userPwd: '',
    confirmPassword: '',
    userName: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isUserIdAvailablerId, setIsUserIdAvailablerId] = useState(null);

  const handleChange = (e) => {
    console.log("test",e.target);
    const { name, value } = e.target;
    console.log("test1",name);
    console.log("test2",value);
    setFormData({ ...formData, [name]: value });

    // 실시간 비밀번호 일치 확인
    if (name === 'confirmPassword' || name === 'userPwd') {
      if (name === 'confirmPassword' && value !== formData.userPwd) {
        setErrors({ ...errors, confirmPassword: '비밀번호가 일치하지 않습니다.' });
      } else if (name === 'userPwd' && formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors({ ...errors, confirmPassword: '비밀번호가 일치하지 않습니다.' });
      } else {
        setErrors({ ...errors, confirmPassword: '' });
      }
    }
  };

  const checkUserId = async () => {
    // 간단한 중복 체크 (실제로는 API 호출)
    if (!formData.userId) {
      setIsUserIdAvailablerId(false)
      setErrors({ ...errors, userId: '아이디를 입력하세요.' });
      return;
    }
    const params = new URLSearchParams({
      userId: formData.userId
    });
    const response = await fetch(`http://localhost:8080/api/user/selectUserCnt?${params}`, {
      method: 'GET', 
      headers: {
        'Content-Type': 'application/json',
      },
    });  
    if(response.ok) {
      const data = await response.json();
      data[0].cnt === 0 ? setIsUserIdAvailablerId(true) : setIsUserIdAvailablerId(false);
      if (data[0].cnt > 0) {
        setErrors({ ...errors, userId: '이미 사용 중인 아이디입니다.' });
      } else {
        //setErrors({ ...errors, userId: '' });
      }
    }else{
      setErrors({ ...errors, userId: '아이디 중복확인 실패하였습니다.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // 유효성 검사
    if (!formData.userId) newErrors.userId = '아이디를 입력하세요.';
    checkUserId();
    if (!formData.userPwd) newErrors.userPwd = '비밀번호를 입력하세요.';
    if (formData.userPwd !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (!formData.userName) newErrors.userName = '이름을 입력하세요.';
    //if (!formData.email) newErrors.email = '이메일을 입력하세요.';
    //if (isUserIdAvailablerId === false) newErrors.userId = '아이디 중복을 확인하세요.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // 회원가입 성공 (실제로는 API 호출)
      const response = await fetch('http://localhost:8080/api/user/save', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });      
      if (response.ok) {
        const existingUsers = await response.json();
        //localStorage.setItem('users', JSON.stringify(existingUsers));
        alert('회원가입 성공!');     
        onSignupSuccess();
      }else{
        alert('회원가입에 실패하였습니다.');
        return;
      }
      // 로그인 페이지로 이동 또는 다른 처리
    }else{
        console.log(errors);
        alert(errors);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 overflow-auto">
      <div className="w-full max-w-md py-8">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <span className="text-white text-2xl" style={{ fontWeight: 'bold' }}>M</span>
          </div>
          <h1 className="text-3xl mb-2" style={{ fontWeight: 500 }}>새로운 계정 만들기</h1>
          <p className="text-sm text-gray-600" style={{ fontWeight: 'normal' }}>MyApp에 가입하여 시작하세요</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이름 입력 */}
            <div>
              <label htmlFor="name" className="block text-sm mb-2 text-gray-700">
                이름
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  id="name"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="이름"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  style={{ fontWeight: 'normal' }}
                  required
                />
              </div>
            </div>

            {/* 아이디 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                아이디
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  style={{ fontWeight: 'normal' }}
                  required
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  id="userPwd"
                  name="userPwd"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.userPwd}
                  onChange={handleChange}
                  placeholder="8자 이상 입력해주세요"
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  style={{ fontWeight: 'normal' }}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm mb-2 text-gray-700">
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  style={{ fontWeight: 'normal' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-700" style={{ fontWeight: 'normal' }}>
                  <a href="#" className="text-blue-600 hover:text-blue-700">이용약관</a>에 동의합니다 (필수)
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToPrivacy}
                  onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-700" style={{ fontWeight: 'normal' }}>
                  <a href="#" className="text-blue-600 hover:text-blue-700">개인정보처리방침</a>에 동의합니다 (필수)
                </span>
              </label>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm"
            >
              회원가입
            </button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500" style={{ fontWeight: 'normal' }}>또는</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* 소셜 회원가입 */}
          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700" style={{ fontWeight: 'normal' }}>Google로 가입하기</span>
            </button>

            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <svg className="size-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-gray-700" style={{ fontWeight: 'normal' }}>Facebook으로 가입하기</span>
            </button>
          </div>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600" style={{ fontWeight: 'normal' }}>이미 계정이 있으신가요? </span>
            <button 
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-blue-600 hover:text-blue-700" 
              style={{ fontWeight: 'normal', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              로그인
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-600" style={{ fontWeight: 'normal' }}>개인정보처리방침</a>
            <a href="#" className="hover:text-blue-600" style={{ fontWeight: 'normal' }}>이용약관</a>
            <a href="#" className="hover:text-blue-600" style={{ fontWeight: 'normal' }}>쿠키정책</a>
          </div>
          <p className="text-xs text-gray-500 mt-4" style={{ fontWeight: 'normal' }}>© 2026 MyApp. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
