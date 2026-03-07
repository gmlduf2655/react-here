import { useState } from 'react';
import { Trash2, Plus, Clock, Calendar, Check, X, FileText } from 'lucide-react';

interface MustToDoItem {
  id: string;
  text: string;
  tag: string;
}

interface BrainDumpItem {
  id: string;
  text: string;
  tag: string;
  category: string;
}

interface TimeBoxItem {
  id: string;
  hour: number;
  startMinute: number;
  endMinute: number;
  text: string;
  color: string;
}

export function TimeBoxPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBrainDumpIds, setSelectedBrainDumpIds] = useState<string[]>([]);
  
  // 상세 모달 관련 state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBrainDumpForDetail, setSelectedBrainDumpForDetail] = useState<BrainDumpItem | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]); // "9-0", "9-30" 형식
  const [detailText, setDetailText] = useState('');
  const [detailColor, setDetailColor] = useState('#3b82f6'); // 기본 파란색
  
  const [brainDumps, setBrainDumps] = useState<BrainDumpItem[]>([
    { id: '1', text: 'OCEAN - 해기일기가 공개시장에서 성과가 크지 않은 것은?', tag: 'MUST', category: '필수' },
    { id: '2', text: '시계패널은 어떻게', tag: 'MUST', category: '필수' },
    { id: '3', text: '서구팬이 이끌 뉴 만다라 마케팅 UXUI 설계가 되지 않아', tag: 'MUST', category: '필수' },
    { id: '4', text: '개인 프로젝트', tag: 'MUST', category: '필수' },
    { id: '5', text: '델레트리더 전부 타임즈는 브랜딩 난동', tag: 'MUST', category: '필수' },
    { id: '6', text: '엘로나 Timebox 출시 날짜 그리고 가격', tag: 'MUST', category: '필수' },
    { id: '7', text: '쪽 분석 예정', tag: 'MUST', category: '필수' },
  ]);

  const [timeBoxes, setTimeBoxes] = useState<TimeBoxItem[]>([
    { id: '1', hour: 6, startMinute: 30, endMinute: 60, text: 'A-가계부 이커 도움 이유 분석하기 시작', color: '#3b82f6' },
    { id: '2', hour: 9, startMinute: 30, endMinute: 60, text: 'A-모각코 이커 도움 권역 설정', color: '#10b981' },
    { id: '3', hour: 14, startMinute: 30, endMinute: 60, text: 'A-가계부 이커 도움 이유 분석하기 시작', color: '#f59e0b' },
    { id: '4', hour: 15, startMinute: 0, endMinute: 30, text: 'A-모각코 이커 도움 권역 설정', color: '#ef4444' },
    { id: '5', hour: 15, startMinute: 30, endMinute: 60, text: 'A1-마이어팅 도구 계획 단계', color: '#8b5cf6' },
    { id: '6', hour: 17, startMinute: 0, endMinute: 30, text: 'A1-마이어팅 돈벌기', color: '#ec4899' },
    { id: '7', hour: 20, startMinute: 0, endMinute: 30, text: '자비 곤충', color: '#14b8a6' },
    { id: '8', hour: 23, startMinute: 0, endMinute: 30, text: '삼성대리 만다라트 마케팅 난농 실패 누적', color: '#f97316' },
  ]);

  const [newBrainDump, setNewBrainDump] = useState('');

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const toggleBrainDumpSelection = (id: string) => {
    if (selectedBrainDumpIds.includes(id)) {
      // 이미 선택된 항목이면 선택 해제
      setSelectedBrainDumpIds(selectedBrainDumpIds.filter(selectedId => selectedId !== id));
    } else {
      // 선택되지 않은 항목이면, 3개 미만일 때만 선택
      if (selectedBrainDumpIds.length < 3) {
        setSelectedBrainDumpIds([...selectedBrainDumpIds, id]);
      }
    }
  };

  // BRAIN DUMP에서 선택된 항목들을 MUST TO DO로 변환
  const mustToDos = brainDumps
    .filter(item => selectedBrainDumpIds.includes(item.id))
    .map(item => ({
      id: item.id,
      text: item.text,
      tag: 'HOT!!'
    }));

  const addBrainDump = () => {
    if (newBrainDump.trim()) {
      setBrainDumps([...brainDumps, { id: Date.now().toString(), text: newBrainDump, tag: 'MUST', category: '필수' }]);
      setNewBrainDump('');
    }
  };

  const deleteBrainDump = (id: string) => {
    setBrainDumps(brainDumps.filter(item => item.id !== id));
    // 삭제된 항목이 선택되어 있었다면 선택에서도 제거
    setSelectedBrainDumpIds(selectedBrainDumpIds.filter(selectedId => selectedId !== id));
  };

  const addTimeBox = (hour: number, startMinute: number) => {
    const newId = Date.now().toString();
    setTimeBoxes([...timeBoxes, {
      id: newId,
      hour,
      startMinute,
      endMinute: startMinute === 0 ? 30 : 60,
      text: '',
      color: '#3b82f6'
    }]);
  };

  const updateTimeBox = (id: string, text: string) => {
    setTimeBoxes(timeBoxes.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const deleteTimeBox = (id: string) => {
    setTimeBoxes(timeBoxes.filter(item => item.id !== id));
  };

  const resetTimeBox = () => {
    if (confirm('TIME BOX를 초기화하시겠습니까?')) {
      setTimeBoxes([]);
    }
  };

  const getTimeBoxesForSlot = (hour: number, startMinute: number) => {
    return timeBoxes.filter(tb => tb.hour === hour && tb.startMinute === startMinute);
  };

  const openDetailModal = (item: BrainDumpItem) => {
    setSelectedBrainDumpForDetail(item);
    setDetailText(item.text);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBrainDumpForDetail(null);
    setDetailText('');
    setSelectedTimeSlots([]);
    setDetailColor('#3b82f6');
  };

  const saveDetailToTimeBox = () => {
    if (detailText.trim() && selectedTimeSlots.length > 0) {
      const newTimeBoxes = selectedTimeSlots.map((slot) => {
        const [hour, minute] = slot.split('-').map(Number);
        return {
          id: Date.now().toString() + '-' + slot,
          hour,
          startMinute: minute,
          endMinute: minute === 0 ? 30 : 60,
          text: detailText,
          color: detailColor
        };
      });
      setTimeBoxes([...timeBoxes, ...newTimeBoxes]);
      closeDetailModal();
    }
  };

  const toggleTimeSlot = (hour: number, minute: number) => {
    const slotKey = `${hour}-${minute}`;
    if (selectedTimeSlots.includes(slotKey)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slotKey));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slotKey]);
    }
  };

  const isTimeSlotSelected = (hour: number, minute: number) => {
    return selectedTimeSlots.includes(`${hour}-${minute}`);
  };

  const predefinedColors = [
    { name: '파란색', color: '#3b82f6' },
    { name: '초록색', color: '#10b981' },
    { name: '노란색', color: '#f59e0b' },
    { name: '빨간색', color: '#ef4444' },
    { name: '보라색', color: '#8b5cf6' },
    { name: '핑크색', color: '#ec4899' },
    { name: '청록색', color: '#14b8a6' },
    { name: '주황색', color: '#f97316' },
  ];

  return (
    <div className="h-full flex gap-6 bg-gray-50 dark:bg-gray-900">
      {/* 왼쪽 섹션 */}
      <div className="w-1/3 flex flex-col gap-6">
        {/* MUST TO DO */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-1 flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="size-2 bg-red-500 rounded-full"></div>
            <h2 className="text-lg font-semibold dark:text-white">MUST TO DO</h2>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-1 flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="size-2 bg-yellow-500 rounded-full"></div>
            <h2 className="text-lg font-semibold dark:text-white">BRAIN DUMP</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              3개까지 선택 가능
            </span>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            <div className="space-y-2">
              {brainDumps.map((item) => {
                const isSelected = selectedBrainDumpIds.includes(item.id);
                const canSelect = selectedBrainDumpIds.length < 3 || isSelected;
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 group p-2 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleBrainDumpSelection(item.id)}
                      disabled={!canSelect}
                      className={`mt-0.5 size-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : canSelect
                          ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isSelected && <Check className="size-3 text-white" />}
                    </button>
                    <div className="flex-1 flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{item.category}</span>
                        </div>
                        <div className={`text-sm ${isSelected ? 'font-medium dark:text-white' : 'dark:text-gray-200'}`}>
                          {item.text}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(item)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                          title="상세 정보 추가"
                        >
                          <FileText className="size-5 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => deleteBrainDump(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-opacity"
                        >
                          <Trash2 className="size-3 text-gray-400" />
                        </button>
                      </div>
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
                onKeyPress={(e) => e.key === 'Enter' && addBrainDump()}
                placeholder="+ 새 항목 추가"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 TIME BOX */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-semibold dark:text-white">TIME BOX</h2>
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
            <button
              onClick={resetTimeBox}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              새로 만들기
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium dark:text-white">RESET</div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <input type="radio" name="duration" id="30min" defaultChecked />
              <label htmlFor="30min">30-60min</label>
            </div>
          </div>
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
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                                >
                                  <Trash2 className="size-3 text-gray-400" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={tb.text}
                                onChange={(e) => updateTimeBox(tb.id, e.target.value)}
                                placeholder="할 일 입력..."
                                className="w-full mt-1 px-2 py-1 text-sm bg-transparent border-none outline-none dark:text-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => addTimeBox(hour, 0)}
                          className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Plus className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* 30-60분 */}
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
                                  <span>{hour}:{String(tb.startMinute).padStart(2, '0')}-{hour}:{String(tb.endMinute).padStart(2, '0')}</span>
                                </div>
                                <button
                                  onClick={() => deleteTimeBox(tb.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                                >
                                  <Trash2 className="size-3 text-gray-400" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={tb.text}
                                onChange={(e) => updateTimeBox(tb.id, e.target.value)}
                                placeholder="할 일 입력..."
                                className="w-full mt-1 px-2 py-1 text-sm bg-transparent border-none outline-none dark:text-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => addTimeBox(hour, 30)}
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

      {/* 상세 모달 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-white">TIME BOX에 추가</h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 시간 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  시간 선택 (여러 시간대 선택 가능)
                </label>
                <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  <div className="space-y-1">
                    {hours.map((hour) => (
                      <div key={hour} className="flex items-center gap-2">
                        <div className="w-12 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                          {hour}시
                        </div>
                        <div className="flex-1 flex gap-2">
                          <label className="flex-1 flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <input
                              type="checkbox"
                              checked={isTimeSlotSelected(hour, 0)}
                              onChange={() => toggleTimeSlot(hour, 0)}
                              className="cursor-pointer"
                            />
                            <span className="text-sm dark:text-gray-300">
                              {String(hour).padStart(2, '0')}:00 - {String(hour).padStart(2, '0')}:30
                            </span>
                          </label>
                          <label className="flex-1 flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <input
                              type="checkbox"
                              checked={isTimeSlotSelected(hour, 30)}
                              onChange={() => toggleTimeSlot(hour, 30)}
                              className="cursor-pointer"
                            />
                            <span className="text-sm dark:text-gray-300">
                              {String(hour).padStart(2, '0')}:30 - {String(hour + 1).padStart(2, '0')}:00
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {selectedTimeSlots.length > 0 ? (
                    <div>
                      <span className="font-medium">{selectedTimeSlots.length}개 시간대 선택됨</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedTimeSlots.sort((a, b) => {
                          const [aH, aM] = a.split('-').map(Number);
                          const [bH, bM] = b.split('-').map(Number);
                          return aH === bH ? aM - bM : aH - bH;
                        }).map((slot) => {
                          const [hour, minute] = slot.split('-').map(Number);
                          return (
                            <span
                              key={slot}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                            >
                              {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-500">최소 1개의 시간대를 선택해주세요</div>
                  )}
                </div>
              </div>

              {/* 색상 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  색상 선택
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {predefinedColors.map((colorOption) => (
                    <button
                      key={colorOption.color}
                      onClick={() => setDetailColor(colorOption.color)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        detailColor === colorOption.color
                          ? 'border-gray-900 dark:border-white scale-105'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorOption.color + '40' }}
                      title={colorOption.name}
                    >
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: colorOption.color }}
                      ></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 상세 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  할 일 내용
                </label>
                <textarea
                  value={detailText}
                  onChange={(e) => setDetailText(e.target.value)}
                  placeholder="할 일을 입력하세요..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={saveDetailToTimeBox}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  TIME BOX에 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}