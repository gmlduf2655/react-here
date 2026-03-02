import { use, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import dayjs from 'dayjs';
import { useRef } from "react";
import { default as MindMap} from "./MindMap.jsx";
//import "mind-elixir/dist/style.css";

export function MindMapPage() {
  const mindMapRef = useRef(null);
  const [memos, setMemos] = useState([
    {
      memoId: "1",
      regDate: "2026-01-23",
      title: "첫 번째 메모",
      memoContent:
        "메모장에 오신 것을 환영합니다. 여기에 메모 내용이 표시됩니다.",
    },
    {
      memoId: "2",
      regDate: "2026-01-22",
      title: "회의록",
      memoContent:
        "프로젝트 진행 상황 논의\n- 디자인 시스템 구축 완료\n- 다음 주 개발 시작",
    },
  ]);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });
  const fileInputRef = useRef(null);

  const mindData = {
    nodeData: {
      id: "root",
      topic: "프로젝트 메모",
      /*
      children: [
        {
          id: "login",
          topic: "로그인",
          children: [
            { id: "jwt", topic: "JWT 인증", children: [] },
            { id: "refresh", topic: "Refresh Token", children: [] },
          ],
        },
        {
          id: "memo",
          topic: "메모 기능",
          children: [
            { id: "crud", topic: "CRUD", children: [] },
            { id: "tag", topic: "태그", children: [] },
          ],
        },
      ],
      */
     children: []
    },
    linkData: [],
  };                                

  // 날짜 필터링된 메모
  const filteredMemos = memos.filter((memo) => {
    if (!dateFilter.startDate && !dateFilter.endDate) {
      return true;
    }

    if (
      dateFilter.startDate &&
      memo.regDate < dateFilter.startDate
    ) {
      return false;
    }

    if (dateFilter.endDate && memo.regDate > dateFilter.endDate) {
      return false;
    }

    return true;
  });

  // 날짜별로 메모 그룹화
  const groupedMemos = filteredMemos.reduce(
    (groups, memo) => {
      const regDate = memo.regDate;
      if (!groups[regDate]) {
        groups[regDate] = [];
      }
      groups[regDate].push(memo);
      return groups;
    },
    {},
  );

  const handleResetFilter = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      selectMemoData();
    }
  }, [dateFilter]);

  const handleSelectMemo = (memo) => {
    setSelectedMemo(memo);
  };  
  
  useEffect(() => {
    if (selectedMemo) {
      // 선택된 메모에 따라 mindData 업데이트 로직 추가
      console.log("선택된 메모:", selectedMemo);
      // 파이썬에 selectedMemo 전달하여 마인드맵 데이터 받아오기'
      fetchMindMap();
    }
  }, [selectedMemo]);

  const fetchMindMap = async () => {
    try {
      const response = await fetch("http://localhost:8000/mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedMemo.title,
          memo: selectedMemo.memoContent, // 또는 selectedMemo.text
        }),
      });

      const mindData = await response.json();
      console.log("받아온 mindData:", mindData);
      console.log("mindMapRef.current:", mindMapRef.current);

      // MindElixir 갱신
      if (mindMapRef.current) {
        mindMapRef.current.setData(mindData);
      }
    } catch (err) {
      console.error("마인드맵 생성 실패:", err);
    }
  };  

  const selectMemoData = async () => {
    const params = new URLSearchParams({
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate
    });
    try {
      const response = await fetch(`http://localhost:8080/api/memo/selectMemoList?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMemos(data); // data는 배열
      } else {
        setMemos([]);
      }
    } catch (error) {
      // 네트워크 오류 시 로컬에서 로드 
      setMemos([]);
    }
  }  

  const uploadRealm = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", sessionStorage.getItem("userId"));

    const res = await fetch("http://localhost:3001/api/realm-to-csv", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    a.click();
    // 3️⃣ Spring Boot로 전송
    const csvForm = new FormData();
    csvForm.append("file", blob, "converted.csv");

    await fetch("http://localhost:8080/api/memo/uploadMemos", {
      method: "POST",
      body: csvForm,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }    
    
  };

  return (
    <div className="h-full flex gap-6 h-dvh">
      {/* 왼쪽: 메모 리스트 */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg dark:text-white">메모 목록</h3>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".realm"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                uploadRealm(e.target.files[0]);
              }
            }}
          />    
          <button
            onClick={(e)=>{fileInputRef.current?.click()}}
            className="p-2 flex bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="변환"
          >
            <Plus className="size-5" /><span>realm-csv변환</span>
          </button>              
        </div>

        {/* 날짜 필터 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="size-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm dark:text-gray-300">기간 조회</span>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <button
                onClick={handleResetFilter}
                className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <X className="size-3" />
                초기화
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) =>
                setDateFilter({
                  ...dateFilter,
                  startDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter({
                  ...dateFilter,
                  endDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(memos.length >= 0) && (
            <div className="text-xs text-gray-600 dark:text-gray-400 pt-2">
              총 {memos.length}개의 메모
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {Object.keys(groupedMemos)
            .sort((a, b) => b.localeCompare(a)) // 최신 날짜 순
            .map((regDate) => (
              <div key={regDate}>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="size-4" />
                  <span>{regDate}</span>
                </div>
                <div className="space-y-2">
                  {groupedMemos[regDate].map((memo) => (
                    <div
                      key={memo.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMemo?.memoId === memo.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700"
                      }`}
                      onClick={() => handleSelectMemo(memo)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {memo.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {memo.memoContent}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {filteredMemos.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>
                {dateFilter.startDate || dateFilter.endDate
                  ? "해당 기간에 메모가 없습니다."
                  : "메모가 없습니다."}
              </p>
              <p className="text-sm mt-2">
                {dateFilter.startDate || dateFilter.endDate
                  ? "다른 기간을 선택해보세요."
                  : "새 메모를 작성해보세요!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 메모 상세/작성 */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-auto">
        {selectedMemo ? (
          // 메모 상세 보기
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedMemo.regDate}
                </span>
              </div>
            </div>
            <MindMap ref={mindMapRef} data={mindData} />
          </>
        ) : (
          <>
          </>
        )}
      </div>
    </div>
  );
}