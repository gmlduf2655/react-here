import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signUp.css';

function SignUp() {
  const [formData, setFormData] = useState({
    userId: '',
    userPwd: '',
    confirmPassword: '',
    userName: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isUserIdAvailablerId, setIsUserIdAvailablerId] = useState(null);
  const navigate = useNavigate();

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
      if (!isAvailable) {
        setErrors({ ...errors, userId: '이미 사용 중인 아이디입니다.' });
      } else {
        setErrors({ ...errors, userId: '' });
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
    if (!formData.userPwd) newErrors.userPwd = '비밀번호를 입력하세요.';
    if (formData.userPwd !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    if (!formData.userName) newErrors.userName = '이름을 입력하세요.';
    if (!formData.email) newErrors.email = '이메일을 입력하세요.';
    if (isUserIdAvailablerId === false) newErrors.userId = '아이디 중복을 확인하세요.';

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
        navigate('/login');   
      }else{
        alert('회원가입에 실패하였습니다.');
        return;
      }
      // 로그인 페이지로 이동 또는 다른 처리
    }
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          />
          <button type="button" onClick={checkUserId}>중복 확인</button>
          {isUserIdAvailablerId === true && <span className="success">사용 가능한 아이디입니다.</span>}
          {isUserIdAvailablerId === false && errors.userId && <span className="error">{errors.userId}</span>}
        </div>
        <div>
          <label>비밀번호</label>
          <input
            type="password"
            name="userPwd"
            className="singup-userPwd-input"
            value={formData.userPwd}
            onChange={handleChange}
            required
          />
          {errors.userPwd && <span className="error">{errors.userPwd}</span>}
        </div>
        <div>
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            className="singup-userPwd-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>
        <div>
          <label>이름</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
          {errors.userName && <span className="error">{errors.userName}</span>}
        </div>
        <div>
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default SignUp;