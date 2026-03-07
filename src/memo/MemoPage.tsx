import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import dayjs from 'dayjs';

interface Memo {
  memoId: string;
  regDate: string;
  title: string;
  memoContent: string;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

interface MemoFormData {
  regDate: string;
  title: string;
  memoContent: string;
}

export function MemoPage() {
  const [memos, setMemos] = useState<Memo[]>([
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
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MemoFormData>({
    regDate: new Date().toISOString().split("T")[0],
    title: "",
    memoContent: "",
  });
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    (groups: Record<string, Memo[]>, memo) => {
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

  const handleEditMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setIsEditing(true);
    setFormData({
      regDate: memo.regDate,
      title: memo.title,
      memoContent: memo.memoContent,
    });
  };

  const handleSaveMemo = async () => {
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.memoContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    try {
      const memoId = selectedMemo ? selectedMemo.memoId : "";
      const response = await fetch('http://localhost:8080/api/memo/saveMemo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regDate: formData.regDate, title: formData.title, memoContent: formData.memoContent, userId: sessionStorage.getItem("userId"), memoId }),
      });
      if (response.ok) {
        handleCancel();
        selectMemoData();
        alert('메모가 저장되었습니다.');
      } else {
        alert('메모 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleDeleteMemo = async (id: string) => {
    if (confirm("이 메모를 삭제하시겠습니까?")) {
      try {
        const response = await fetch('http://localhost:8080/api/memo/deleteMemo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memoId: id }),
        });
        if (response.ok) {
          handleCancel();
          selectMemoData();
          alert('메모가 삭제되었습니다.');
        } else {
          alert('메모 삭제에 실패했습니다.');
        }
      } catch (error) {
        alert('네트워크 오류가 발생했습니다.');
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

  const handleSelectMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setIsEditing(false);
  };

  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      selectMemoData();
    }
  }, [dateFilter]);

  const selectMemoData = async () => {
    const params = new URLSearchParams({
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate
    });
    try {
      const response = await fetch(`http://localhost:8080/api/memo/selectMemoList?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMemos(data);
      } else {
        setMemos([]);
      }
    } catch (error) {
      setMemos([]);
    }
  }

  const uploadRealm = async (file: File) => {
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("userId", sessionStorage.getItem("userId") || '');

    const res = await fetch("http://localhost:3001/api/realm-to-csv", {
      method: "POST",
      body: uploadForm,
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    a.click();

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.[0]) {
                uploadRealm(e.target.files[0]);
              }
            }}
          />
          <button
            onClick={() => { fileInputRef.current?.click(); }}
            className="p-2 flex bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="변환"
          >
            <Plus className="size-5" /><span>realm-csv변환</span>
          </button>
          <button
            onClick={handleAddNew}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="새 메모 작성"
          >
            <Plus className="size-5" />
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
            .sort((a, b) => b.localeCompare(a))
            .map((regDate) => (
              <div key={regDate}>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="size-4" />
                  <span>{regDate}</span>
                </div>
                <div className="space-y-2">
                  {groupedMemos[regDate].map((memo) => (
                    <div
                      key={memo.memoId}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMemo?.memoId === memo.memoId
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
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        {isEditing ? (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg dark:text-white">
                {selectedMemo ? "메모 수정" : "새 메모 작성"}
              </h3>
            </div>
            <div className="flex-1 p-6 overflow-auto space-y-4">
              <div>
                <label className="block text-sm mb-2 dark:text-gray-300">
                  메모 일자
                </label>
                <input
                  type="regDate"
                  value={formData.regDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      regDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 dark:text-gray-300">
                  메모 제목
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 dark:text-gray-300">
                  메모 내용
                </label>
                <textarea
                  value={formData.memoContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({
                      ...formData,
                      memoContent: e.target.value,
                    })
                  }
                  placeholder="내용을 입력하세요"
                  rows={26}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedMemo.regDate}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditMemo(selectedMemo)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit2 className="size-5" />
                </button>
                <button
                  onClick={() => handleDeleteMemo(selectedMemo.memoId)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-2xl mb-4 dark:text-white">
                {selectedMemo.title}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {selectedMemo.memoContent}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
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
