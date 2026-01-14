import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'  // Navigate 추가
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Memo from './memo/memo.jsx'  // Memo 컴포넌트 import
import Login from './login/Login.jsx'  // Login 컴포넌트 import
import SignUp from './signUp/SignUp.jsx'  // SignUp 컴포넌트 import
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const userId = localStorage.getItem('userId');
    return !!userId;  // userId가 있으면 true, 없으면 false
  });
  const [count, setCount] = useState(0)
  
  return (  
    <Routes>
      <Route path="/" element={isLoggedIn ? (
        <>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.jsx</code> and save to test HMR
            </p>
          </div>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
          <a href="/memo">Go to Memo</a>  {/* /memo로 이동하는 링크 추가 */}
        </>
      ) : <Navigate to="/login" />} />
      <Route path="/memo" element={isLoggedIn ? <Memo /> : <Navigate to="/login" />} />  {/* 로그인 체크 추가 */}
      <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />  {/* setIsLoggedIn 전달 */}
      <Route path="/signup" element={<SignUp />} />  {/* SignUp 경로 추가 */}
    </Routes>
  )
}

export default App