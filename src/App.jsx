import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'  // 추가
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Memo from './memo/memo.jsx'  // Memo 컴포넌트 import
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={
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
      } />
      <Route path="/memo" element={<Memo />} />  {/* /memo 경로에 Memo 컴포넌트 */}
    </Routes>
  )
}

export default App