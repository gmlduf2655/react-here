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

export function MemoPage() {
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    regDate: new Date().toISOString().split("T")[0],
    title: "",
    memoContent: "",
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });

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

  const handleAddNew = () => {
    setSelectedMemo(null);
    setIsEditing(true);
    setFormData({
      regDate: new Date().toISOString().split("T")[0],
      title: "",
      memoContent: "",
    });
  };

  const handleEditMemo = (memo) => {
    setSelectedMemo(memo);
    setIsEditing(true);
    setFormData({
      regDate: memo.regDate,
      title: memo.title,
      memoContent: memo.memoContent,
    });
  };

  const handleSaveMemo = () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (selectedMemo) {
      // 수정
      setMemos(
        memos.map((memo) =>
          memo.id === selectedMemo.id
            ? { ...memo, ...formData }
            : memo,
        ),
      );
    } else {
      // 새로 추가
      const newMemo = {
        id: Date.now().toString(),
        ...formData,
      };
      setMemos([newMemo, ...memos]);
    }

    setIsEditing(false);
    setSelectedMemo(null);
    setFormData({
      regDate: new Date().toISOString().split("T")[0],
      title: "",
      memoContent: "",
    });
  };

  const handleDeleteMemo = (id) => {
    if (confirm("이 메모를 삭제하시겠습니까?")) {
      setMemos(memos.filter((memo) => memo.id !== id));
      if (selectedMemo?.id === id) {
        setSelectedMemo(null);
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedMemo(null);
    setFormData({
      regDate: new Date().toISOString().split("T")[0],
      title: "",
      memoContent: "",
    });
  };

  const handleSelectMemo = (memo) => {
    setSelectedMemo(memo);
    setIsEditing(false);
  };

  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      selectMemo();
    }
  }, [dateFilter]);

  const selectMemo = async () => {
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

  return (
    <div className="h-full flex gap-6 h-dvh">
      {/* 왼쪽: 메모 리스트 */}
      <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg">메모 목록</h3>
          <button
            onClick={handleAddNew}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="새 메모 작성"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {/* 날짜 필터 */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="size-4 text-gray-600" />
            <span className="text-sm">기간 조회</span>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <button
                onClick={handleResetFilter}
                className="ml-auto text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="size-3" />
                초기화
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(memos.length >= 0) && (
            <div className="text-xs text-gray-600 pt-2">
              총 {memos.length}개의 메모
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {Object.keys(groupedMemos)
            .sort((a, b) => b.localeCompare(a)) // 최신 날짜 순
            .map((regDate) => (
              <div key={regDate}>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Calendar className="size-4" />
                  <span>{regDate}</span>
                </div>
                <div className="space-y-2">
                  {groupedMemos[regDate].map((memo) => (
                    <div
                      key={memo.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMemo?.id === memo.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => handleSelectMemo(memo)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {memo.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {memo.memoContent}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {filteredMemos.length === 0 && (
            <div className="text-center text-gray-500 py-8">
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
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        {isEditing ? (
          // 편집 모드
          <>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg">
                {selectedMemo ? "메모 수정" : "새 메모 작성"}
              </h3>
            </div>
            <div className="flex-1 p-6 overflow-auto space-y-4">
              <div>
                <label className="block text-sm mb-2">
                  메모 일자
                </label>
                <input
                  type="regDate"
                  value={formData.regDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      regDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  메모 제목
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  메모 내용
                </label>
                <textarea
                  value={formData.memoContent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memoContent: e.target.value,
                    })
                  }
                  placeholder="내용을 입력하세요"
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveMemo}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </>
        ) : selectedMemo ? (
          // 메모 상세 보기
          <>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-gray-600" />
                <span className="text-gray-600">
                  {selectedMemo.regDate}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMemo(selectedMemo)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit2 className="size-5" />
                </button>
                <button
                  onClick={() =>
                    handleDeleteMemo(selectedMemo.id)
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-2xl mb-4">
                {selectedMemo.title}
              </h2>
              <div className="text-gray-700 whitespace-pre-wrap">
                {selectedMemo.memoContent}
              </div>
            </div>
          </>
        ) : (
          // 메모 선택 안 됨
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg">
                메모를 선택하거나 새로 작성해보세요
              </p>
              <button
                onClick={handleAddNew}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="size-5" />새 메모 작성
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}