import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login({ setIsLoggedIn }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { userId, password });
    const params = new URLSearchParams({
      userId: userId,
      userPwd: password
    });
    const response = await fetch(`http://localhost:8080/api/user/loginUser?${params}`);
    if (response.ok) {
      const data = await response.json();
      if(data.length > 0) {
        localStorage.setItem('userId', data[0].userId);
        localStorage.setItem('userName', data[0].userName);
        localStorage.setItem('email', data[0].email);
        setIsLoggedIn(true);  // 로그인 성공 시 상태 변경
        alert('로그인에 성공했습니다.');
        navigate('/');  // 메인 페이지로 이동
      } else{
        setIsLoggedIn(false);  // 로그인 실패 시 상태 변경
        alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');        
      }
    } else {
      setIsLoggedIn(false);  // 로그인 실패 시 상태 변경
      alert('로그인에 실패했습니다. ');
    }    
  };

  const handleSignUp = () => {
    // 회원가입 페이지로 이동
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      <button className="signup-button" onClick={handleSignUp}>회원가입</button>
    </div>
  );
}

export default Login;