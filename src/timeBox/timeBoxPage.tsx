import { useState, useEffect } from 'react';
import { Trash2, Clock, Calendar, Check, FileText, Plus } from 'lucide-react';
import { BrainDumpDetailModal } from './brainDumpDetailModal';
import { BrainDumpSelectModal } from './brainDumpSelectModal';

const API_BASE = 'http://localhost:8080/api/timebox';

export interface BrainDumpItem {
  id: string;
  text: string;
  category: string;
  priorityYn: string;
  completeYn: string;
}

interface TimeBoxItem {
  id: string;
  dumpId: string;
  hour: number;
  startMinute: number;
  endMinute: number;
  text: string;
  color: string;
}

export function TimeBoxPage() {
  const userId = sessionStorage.getItem('userId') || '';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBrainDumpIds, setSelectedBrainDumpIds] = useState<string[]>([]);

  // 상세 모달 관련 state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBrainDumpForDetail, setSelectedBrainDumpForDetail] = useState<BrainDumpItem | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]); // "9-0", "9-30" 형식
  const [detailColor, setDetailColor] = useState('#3b82f6');

  const [brainDumps, setBrainDumps] = useState<BrainDumpItem[]>([]);
  const [timeBoxes, setTimeBoxes] = useState<TimeBoxItem[]>([]);
  const [newBrainDump, setNewBrainDump] = useState('');
  const [checkedForDelete, setCheckedForDelete] = useState<string[]>([]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // BRAIN DUMP 선택 모달 관련 state
  const [isBrainDumpSelectModalOpen, setIsBrainDumpSelectModalOpen] = useState(false);
  const [selectedTimeSlotInfo, setSelectedTimeSlotInfo] = useState<{ hour: number; startMinute: number } | null>(null);
  const [selectedBrainDumpForTimeBox, setSelectedBrainDumpForTimeBox] = useState<string[]>([]);

  // 날짜 변경 시 데이터 재조회
  useEffect(() => {
    fetchBrainDumps();
    fetchTimeBoxes();
  }, [selectedDate]);

  const fetchBrainDumps = async () => {
    try {
      const params = new URLSearchParams({ userId, tboxDate: selectedDate });
      const res = await fetch(`${API_BASE}/selectBrainDumpList?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped: BrainDumpItem[] = data.map((d: Record<string, string>) => ({
        id: d.dumpId,
        text: d.dumpTitle,
        category: '필수',
        priorityYn: d.priorityYn || 'N',
        completeYn: d.completeYn || 'N',
      }));
      setBrainDumps(mapped);
      // priorityYn === 'Y'인 항목을 선택 상태로 복원
      setSelectedBrainDumpIds(mapped.filter(d => d.priorityYn === 'Y').map(d => d.id));
    } catch (e) {
      console.error('Brain dump 조회 실패:', e);
    }
  };

  const fetchTimeBoxes = async () => {
    try {
      const params = new URLSearchParams({ userId, tboxDate: selectedDate });
      const res = await fetch(`${API_BASE}/selectTimeTableList?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped: TimeBoxItem[] = data.map((d: Record<string, string>) => ({
        id: d.timeTableId,
        dumpId: d.dumpId,
        hour: Number(d.timeHour),
        startMinute: Number(d.timeMinute),
        endMinute: Number(d.timeMinute) + 30,
        text: d.dumpTitle || '',
        color: d.color || '#3b82f6',
      }));
      setTimeBoxes(mapped);
    } catch (e) {
      console.error('TIME TABLE 조회 실패:', e);
    }
  };

  // TOP 3 PRIORITY: 선택된 brain dump 항목
  const mustToDos = brainDumps
    .filter(item => selectedBrainDumpIds.includes(item.id))
    .map(item => ({ id: item.id, text: item.text, tag: 'HOT!!' }));

  const toggleBrainDumpSelection = async (id: string) => {
    const isSelected = selectedBrainDumpIds.includes(id);
    if (!isSelected && selectedBrainDumpIds.length >= 3) return;

    const newPriorityYn = isSelected ? 'N' : 'Y';
    setSelectedBrainDumpIds(prev =>
      isSelected ? prev.filter(sid => sid !== id) : [...prev, id]
    );

    const target = brainDumps.find(d => d.id === id);
    if (!target) return;
    try {
      await fetch(`${API_BASE}/saveBrainDump`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dumpId: id,
          tboxDate: selectedDate,
          userId,
          dumpTitle: target.text,
          priorityYn: newPriorityYn,
        }),
      });
    } catch (e) {
      console.error('우선순위 저장 실패:', e);
    }
  };

  // 새로운 brain dump 추가
  const addBrainDump = async () => {
    if (!newBrainDump.trim()) return;
    try {
      await fetch(`${API_BASE}/saveBrainDump`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tboxDate: selectedDate,
          userId,
          dumpTitle: newBrainDump.trim(),
          priorityYn: 'N',
          status: '1',
        }),
      });
      setNewBrainDump('');
      fetchBrainDumps();
    } catch (e) {
      console.error('Brain dump 추가 실패:', e);
    }
  };

  const deleteCheckedBrainDumps = async () => {
    if (checkedForDelete.length === 0) return;
    try {
      await fetch(`${API_BASE}/deleteBrainDumpList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dumpIds: checkedForDelete }),
      });
      // ON DELETE CASCADE로 연결된 time table도 DB에서 자동 삭제
      setBrainDumps(prev => prev.filter(item => !checkedForDelete.includes(item.id)));
      setSelectedBrainDumpIds(prev => prev.filter(sid => !checkedForDelete.includes(sid)));
      setTimeBoxes(prev => prev.filter(tb => !checkedForDelete.includes(tb.dumpId)));
      setCheckedForDelete([]);
    } catch (e) {
      console.error('Brain dump 삭제 실패:', e);
    }
  };

  const toggleComplete = async (item: BrainDumpItem) => {
    const newcompleteYn = item.completeYn === 'Y' ? 'N' : 'Y';
    setBrainDumps(prev =>
      prev.map(d => d.id === item.id ? { ...d, completeYn: newcompleteYn } : d)
    );
    try {
      await fetch(`${API_BASE}/saveBrainDump`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dumpId: item.id,
          tboxDate: selectedDate,
          userId,
          dumpTitle: item.text,
          priorityYn: item.priorityYn,
          completeYn: newcompleteYn,
        }),
      });
    } catch (e) {
      console.error('완료여부 저장 실패:', e);
      setBrainDumps(prev =>
        prev.map(d => d.id === item.id ? { ...d, completeYn: item.completeYn } : d)
      );
    }
  };

  const deleteTimeBox = async (id: string) => {
    try {
      await fetch(`${API_BASE}/deleteTimeTable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeTableId: id }),
      });
      setTimeBoxes(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error('TIME TABLE 삭제 실패:', e);
    }
  };

  const resetTimeBox = async () => {
    if (!confirm('TIME TABLE를 초기화하시겠습니까?')) return;
    try {
      await Promise.all(
        timeBoxes.map(tb =>
          fetch(`${API_BASE}/deleteTimeTable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeTableId: tb.id }),
          })
        )
      );
      setTimeBoxes([]);
    } catch (e) {
      console.error('TIME TABLE 초기화 실패:', e);
    }
  };

  const getTimeBoxesForSlot = (hour: number, startMinute: number) => {
    return timeBoxes.filter(tb => tb.hour === hour && tb.startMinute === startMinute);
  };

  const openDetailModal = async (item: BrainDumpItem) => {
    setSelectedBrainDumpForDetail(item);

    try {
      var userId = sessionStorage.getItem('userId') || '';
      const params = new URLSearchParams({ dumpId: item.id, userId });
      const res = await fetch(`${API_BASE}/selectTimeTableByDumpId?${params}`);
      if (res.ok) {
        const data: Record<string, string>[] = await res.json();
        setSelectedTimeSlots(data.map((d) => `${d.timeHour}-${d.timeMinute}`));
        if (data.length > 0 && data[0].color) {
          setDetailColor(data[0].color);
        }
      }
    } catch (e) {
      console.error('시간 설정 조회 실패:', e);
    }

    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBrainDumpForDetail(null);
    setSelectedTimeSlots([]);
    setDetailColor('#3b82f6');
  };

  const saveDetailToTimeBox = async () => {
    if (!selectedBrainDumpForDetail || selectedTimeSlots.length === 0) return;
    try {
      await Promise.all(
        selectedTimeSlots.map(slot => {
          const [hour, minute] = slot.split('-').map(Number);
          return fetch(`${API_BASE}/saveTimeTable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dumpId: selectedBrainDumpForDetail.id,
              tboxDate: selectedDate,
              userId,
              timeHour: hour,
              timeMinute: minute,
              color: detailColor,
              dumpContent: selectedBrainDumpForDetail.text,
              completeYn: selectedBrainDumpForDetail.completeYn
            }),
          });
        })
      );
      closeDetailModal();
      fetchTimeBoxes();
    } catch (e) {
      console.error('TIME TABLE 저장 실패:', e);
    }
  };

  const toggleTimeSlot = (hour: number, minute: number) => {
    const slotKey = `${hour}-${minute}`;
    setSelectedTimeSlots(prev =>
      prev.includes(slotKey) ? prev.filter(s => s !== slotKey) : [...prev, slotKey]
    );
  };

  const openBrainDumpSelectModal = (hour: number, startMinute: number) => {
    setSelectedTimeSlotInfo({ hour, startMinute });
    setIsBrainDumpSelectModalOpen(true);
  };

  const closeBrainDumpSelectModal = () => {
    setIsBrainDumpSelectModalOpen(false);
    setSelectedTimeSlotInfo(null);
    setSelectedBrainDumpForTimeBox([]);
  };

  // 로직추가 필요
  const addBrainDumpToTimeBox = () => {
    if (selectedBrainDumpForTimeBox.length > 0 && selectedTimeSlotInfo) {
      const brainDumpItem = brainDumps.find(
        (item) => item.id === selectedBrainDumpForTimeBox[0],
      );
      if (brainDumpItem) {
        closeBrainDumpSelectModal();
      }
    }
  };

  return (
    <div className="h-full flex gap-6 bg-gray-50 dark:bg-gray-900">
      {/* 왼쪽 섹션 */}
      <div className="w-1/3 flex flex-col gap-6">
        {/* TOP 3 PRIORITY */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-[1] flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="size-2 bg-red-500 rounded-full"></div>
            <h2 className="text-lg font-semibold dark:text-white">TOP 3 PRIORITY</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {mustToDos.length}/3 선택됨
            </span>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {mustToDos.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                BRAIN DUMP에서 최대 3개 항목을 선택하세요
              </div>
            ) : (
              <div className="space-y-2">
                {mustToDos.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 group">
                    <input type="checkbox" className="mt-1 flex-shrink-0" defaultChecked />
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm dark:text-gray-200">{item.text}</div>
                      </div>
                      <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BRAIN DUMP */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-[3] flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="size-2 bg-yellow-500 rounded-full"></div>
            <h2 className="text-lg font-semibold dark:text-white">BRAIN DUMP</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              3개까지 선택 가능
            </span>
            <button
              onClick={deleteCheckedBrainDumps}
              disabled={checkedForDelete.length === 0}
              className="flex items-center justify-center w-16 px-2 py-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors text-red-600 dark:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="size-5 text-red-400" />
              <span className="text-sm text-red-500 dark:text-red-400">삭제</span>
            </button>
          </div>

          {/* 헤더 */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400 text-center flex-shrink-0">
                선택
              </div>
              <div className="flex-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                제목
              </div>
              <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400 text-center flex-shrink-0">
                Top 3
              </div>
              <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400 text-center flex-shrink-0">
                완료
              </div>
              <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400 text-center flex-shrink-0">
                상세
              </div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <div className="space-y-2">
              {brainDumps.map((item) => {
                const isSelected = selectedBrainDumpIds.includes(item.id);
                const canSelect = selectedBrainDumpIds.length < 3 || isSelected;

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 group p-0 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    {/* 선택 체크박스 (삭제용) */}
                    <div className="w-8 flex items-start justify-center">
                      <button
                        onClick={() =>
                          setCheckedForDelete(prev =>
                            prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                          )
                        }
                        className={`mt-0.5 size-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          checkedForDelete.includes(item.id)
                            ? "bg-red-500 border-red-500"
                            : "border-gray-300 dark:border-gray-600 hover:border-red-400"
                        }`}
                      >
                        {checkedForDelete.includes(item.id) && (
                          <Check className="size-3 text-white" />
                        )}
                      </button>
                    </div>

                    {/* 제목 */}
                    <div className="flex-1">
                      <div className={`text-sm ${isSelected ? "font-medium dark:text-white" : "dark:text-gray-200"}`}>
                        {item.text}
                      </div>
                    </div>

                    {/* Top 3 체크박스 */}
                    <div className="w-12 flex items-start justify-center">
                      <button
                        onClick={() => toggleBrainDumpSelection(item.id)}
                        disabled={!canSelect}
                        className={`mt-0.5 size-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : canSelect
                              ? "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                              : "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isSelected && (
                          <Check className="size-3 text-white" />
                        )}
                      </button>
                    </div>

                    {/* 완료 체크박스 */}
                    <div className="w-12 flex items-start justify-center">
                      <button
                        onClick={() => toggleComplete(item)}
                        className={`mt-0.5 size-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          item.completeYn === 'Y'
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                      >
                        {item.completeYn === 'Y' && (
                          <Check className="size-3 text-white" />
                        )}
                      </button>
                    </div>

                    {/* 상세 버튼 */}
                    <div className="w-12 flex items-start justify-center">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="flex items-center justify-center w-16 px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                        title="상세 보기"
                      >
                        <FileText className="size-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newBrainDump}
                onChange={(e) => setNewBrainDump(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBrainDump()}
                placeholder="+ 새 항목 추가"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 TIME TABLE */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-semibold dark:text-white">TIME TABLE</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="size-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border border-gray-200 dark:border-gray-700 px-2 py-1 rounded dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={resetTimeBox}
            className="text-sm font-medium dark:text-white"
          >
            RESET
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <div className="space-y-1">
              {hours.map((hour) => (
                <div key={hour} className="flex gap-2">
                  {/* 시간 표시 */}
                  <div className="w-12 pt-2 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {hour}
                  </div>

                  {/* 30분 단위 타임박스 */}
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {/* 0-30분 */}
                    <div className="min-h-[60px] border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      {getTimeBoxesForSlot(hour, 0).length > 0 ? (
                        <div className="space-y-1">
                          {getTimeBoxesForSlot(hour, 0).map((tb) => (
                            <div
                              key={tb.id}
                              className="group relative p-2 rounded-lg"
                              style={{ backgroundColor: tb.color + '20', borderLeft: `3px solid ${tb.color}` }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: tb.color }}>
                                  <Clock className="size-3" />
                                  <span>{hour}:{String(tb.startMinute).padStart(2, '0')}-{hour}:{String(tb.endMinute).padStart(2, '0')}</span>
                                </div>
                                <button
                                  onClick={() => deleteTimeBox(tb.id)}
                                  className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                                >
                                  <Trash2 className="size-3 text-gray-400" />
                                </button>
                              </div>
                              <p className="mt-1 px-2 py-1 text-sm dark:text-gray-200 truncate">
                                {tb.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => openBrainDumpSelectModal(hour, 0)}
                          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Plus className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* 30-00분 */}
                    <div className="min-h-[60px] border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      {getTimeBoxesForSlot(hour, 30).length > 0 ? (
                        <div className="space-y-1">
                          {getTimeBoxesForSlot(hour, 30).map((tb) => (
                            <div
                              key={tb.id}
                              className="group relative p-2 rounded-lg"
                              style={{ backgroundColor: tb.color + '20', borderLeft: `3px solid ${tb.color}` }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: tb.color }}>
                                  <Clock className="size-3" />
                                  <span>
                                    {hour}:{String(tb.startMinute).padStart(2, '0')}
                                    -{tb.endMinute === 60 ? hour + 1 : hour}:{String(tb.endMinute === 60 ? 0 : tb.endMinute).padStart(2, '0')}
                                  </span>
                                </div>
                                <button
                                  onClick={() => deleteTimeBox(tb.id)}
                                  className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                                >
                                  <Trash2 className="size-3 text-gray-400" />
                                </button>
                              </div>
                              <p className="mt-1 px-2 py-1 text-sm dark:text-gray-200 truncate">
                                {tb.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => openBrainDumpSelectModal(hour, 30)}
                          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Plus className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BrainDumpDetailModal
        isOpen={isDetailModalOpen}
        brainDumpItem={selectedBrainDumpForDetail}
        selectedTimeSlots={selectedTimeSlots}
        color={detailColor}
        onClose={closeDetailModal}
        onSave={saveDetailToTimeBox}
        onToggleTimeSlot={toggleTimeSlot}
        onColorChange={setDetailColor}
      />
      <BrainDumpSelectModal
        isOpen={isBrainDumpSelectModalOpen}
        timeSlotInfo={selectedTimeSlotInfo}
        brainDumps={brainDumps}
        selectedIds={selectedBrainDumpForTimeBox}
        onClose={closeBrainDumpSelectModal}
        onConfirm={addBrainDumpToTimeBox}
        onToggleItem={(id) =>
          setSelectedBrainDumpForTimeBox((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
      />
    </div>
  );
}
