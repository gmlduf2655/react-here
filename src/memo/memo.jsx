import { useState, useEffect } from 'react'
import './memo.css'

function Memo() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [memos, setMemos] = useState([])
  const [memoId, setmemoId] = useState(null)

  useEffect(() => {
    const savedMemos = localStorage.getItem('dailyMemos')
    if (savedMemos) {
      setMemos(JSON.parse(savedMemos))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('dailyMemos', JSON.stringify(memos))
  }, [memos])

  const selectMemo = async (date) => {
    const params = new URLSearchParams({
      regDate: date
    });
    try {
      const response = await fetch(`http://localhost:8080/api/memo/selectMemoList?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMemos(data); // data는 배열
      } else {

      }
      setmemoId(null);
      setTitle('');
      setMemo('');      
    } catch (error) {
      // 네트워크 오류 시 로컬에서 로드 
      setmemoId(null);
      setTitle(''); 
      setMemo('');
    }
  }

  useEffect(() => {
    selectMemo(currentDate);
  }, [currentDate]);
  
  const saveMemo = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');  
      return;
    }
    if (!memo.trim()) {
      alert('메모 내용을 입력해주세요.');
      return;
    }
    try {
      const saveData = memos.find(item => item.memoId === memoId);
      const response = await fetch('http://localhost:8080/api/memo/save', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regDate: currentDate, title, memoContent: memo, userId: "here", memoId }),
      });
      if (response.ok) {
        selectMemo(currentDate);
        /*
        setMemos(prev => {
          const existingIndex = prev.findIndex(item => item.regDate === currentDate);
          if (existingIndex >= 0) {
            prev[existingIndex] = { regDate: currentDate, title, content: memo };
          } else {
            prev.push({ regDate: currentDate, title, content: memo });
          }
          return [...prev];
        });
        */
      } else {
        alert('메모 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  }

  return (
    <div className="app">
      <h1>Daily Memo</h1>
      <div className="date-selector">
        <label htmlFor="date">작성 일자 </label>
        <input 
          type="date" 
          id="date" 
          value={currentDate} 
          onChange={(e) => setCurrentDate(e.target.value)} 
        />
      </div>
      <div className="memo-section">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}  
          placeholder="제목을 입력하세요" 
        />  
        <textarea 
          value={memo} 
          onChange={(e) => setMemo(e.target.value)} 
          placeholder="메모를 작성해주세요..." 
          rows="10" 
        />
        <button onClick={saveMemo}>저장</button>
      </div>
      <div className="saved-memos">
        <h2>저장된 메모</h2>
        {memos.sort((a, b) => b.memoId - a.memoId).map(rowData => (
          <div key={rowData.memoId} className="memo-item" onClick={() => {
            setmemoId(rowData.memoId);
            setCurrentDate(rowData.regDate);
            setTitle(rowData.title || '');
            setMemo(rowData.memoContent || '');
          }}>
            <h3>{rowData.regDate}</h3>
            <h4>{rowData.title || '제목 없음'}</h4>
            <p>{rowData.memoContent}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Memo