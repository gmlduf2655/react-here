import { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, Calendar, Filter, X } from 'lucide-react';

const BASE_URL = 'http://localhost:8080/api';

const COLORS = {
  center: 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700',
  subGoal: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700',
  action: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600',
  centerText: 'text-blue-900 dark:text-blue-200',
  subGoalText: 'text-purple-900 dark:text-purple-200',
  actionText: 'text-gray-700 dark:text-gray-300',
};

interface Cell {
  value: string;
}

type Grid = Cell[][];

interface Mandalart {
  id: string;
  title: string;
  date: string;
}

interface MandalartNode {
  cellId: string;
  mandalartId: string;
  userId: string;
  regDate: string;
  lvl: string;
  cellRow: string;
  cellCol: string;
  mandalartContent: string;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

const createEmptyGrid = (): Grid =>
  Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({ value: '' }))
  );

const getLvl = (row: number, col: number): string => {
  if (row === 4 && col === 4) return '0';
  if (row >= 3 && row <= 5 && col >= 3 && col <= 5) return '1';
  if (row % 3 === 1 && col % 3 === 1) return '1';
  return '2';
};

const gridToNodes = (grid: Grid, mandalartId: string, userId: string, regDate: string): MandalartNode[] => {
  const nodes: MandalartNode[] = [];
  grid.forEach((row, rowIndex) =>
    row.forEach((cell, colIndex) => {
      if (cell.value.trim()) {
        nodes.push({
          cellId: `${rowIndex}_${colIndex}`,
          mandalartId,
          userId,
          regDate,
          lvl: getLvl(rowIndex, colIndex),
          cellRow: String(rowIndex),
          cellCol: String(colIndex),
          mandalartContent: cell.value,
        });
      }
    })
  );
  return nodes;
};

const nodesToGrid = (nodes: MandalartNode[]): Grid => {
  const grid = createEmptyGrid();
  nodes.forEach((node) => {
    const row = parseInt(node.cellRow);
    const col = parseInt(node.cellCol);
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      grid[row][col] = { value: node.mandalartContent || '' };
    }
  });
  return grid;
};

export function MandalartPage() {
  const [mandalarts, setMandalarts] = useState<Mandalart[]>([]);
  const [selectedMandalart, setSelectedMandalart] = useState<Mandalart | null>(null);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return {
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  });

  const selectMandalartListData = async () => {
    const userId = sessionStorage.getItem('userId') || '';
    const params = new URLSearchParams({ userId });
    if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
    if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
    try {
      const res = await fetch(`${BASE_URL}/mandalart/selectMandalartList?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMandalarts(data.map((m: { mandalartId: string; mandalartTitle: string; regDate: string }) => ({
          id: m.mandalartId,
          title: m.mandalartTitle || '(제목 없음)',
          date: m.regDate,
        })));
      }
    } catch {}
  };

  useEffect(() => {
    selectMandalartListData();
  }, [dateFilter]);

  const groupedMandalarts = mandalarts.reduce((groups: Record<string, Mandalart[]>, item) => {
    const date = item.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  const handleResetFilter = () => {
    setDateFilter({ startDate: '', endDate: '' });
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? { value } : cell))
    );

    if (row >= 3 && row <= 5 && col >= 3 && col <= 5 && !(row === 4 && col === 4)) {
      const subRow = row - 3;
      const subCol = col - 3;
      const targetRow = subRow * 3 + 1;
      const targetCol = subCol * 3 + 1;
      newGrid[targetRow][targetCol] = { value };
    }

    setGrid(newGrid);
  };

  const getCellColor = (row: number, col: number): string => {
    if (row === 4 && col === 4) return COLORS.center;
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) return COLORS.subGoal;
    const isSubGoalCenter = row % 3 === 1 && col % 3 === 1;
    if (isSubGoalCenter) return COLORS.subGoal;
    return COLORS.action;
  };

  const getCellTextColor = (row: number, col: number): string => {
    if (row === 4 && col === 4) return COLORS.centerText;
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) return COLORS.subGoalText;
    const isSubGoalCenter = row % 3 === 1 && col % 3 === 1;
    if (isSubGoalCenter) return COLORS.subGoalText;
    return COLORS.actionText;
  };

  const isActionCellEditable = (row: number, col: number): boolean => {
    if (row === 4 && col === 4) return true;
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) return true;
    const isSubGoalCenter = row % 3 === 1 && col % 3 === 1;
    if (isSubGoalCenter) return true;
    const blockCenterRow = Math.floor(row / 3) * 3 + 1;
    const blockCenterCol = Math.floor(col / 3) * 3 + 1;
    return grid[blockCenterRow][blockCenterCol].value.trim() !== '';
  };

  const handleReset = () => {
    if (confirm('모든 내용을 초기화하시겠습니까?')) {
      setGrid(createEmptyGrid());
    }
  };

  const handleSaveCurrentMandalart = async () => {
    if (!selectedMandalart) {
      alert('만다라트를 선택하거나 새로 만들어주세요.');
      return;
    }

    const userId = sessionStorage.getItem('userId') || '';
    const nodes = gridToNodes(grid, selectedMandalart.id, userId, selectedMandalart.date);

    if (nodes.length === 0) {
      alert('저장할 내용이 없습니다.');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/mandalart/saveMandalartNodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodes),
      });
      if (res.ok) {
        alert('저장되었습니다!');
        selectMandalartListData();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleAddNewMandalart = async () => {
    const title = prompt('만다라트 제목을 입력하세요:');
    if (!title) return;

    const userId = sessionStorage.getItem('userId') || '';
    const newId = Date.now().toString();
    const today = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch(`${BASE_URL}/mandalart/saveMandalartNode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cellId: '4_4',
          mandalartId: newId,
          userId,
          regDate: today,
          lvl: '0',
          cellRow: '4',
          cellCol: '4',
          mandalartContent: title,
        }),
      });
      if (!res.ok) {
        alert('만다라트 생성에 실패했습니다.');
        return;
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
      return;
    }

    const newGrid = createEmptyGrid();
    newGrid[4][4] = { value: title };
    setSelectedMandalart({ id: newId, title, date: today });
    setGrid(newGrid);
    selectMandalartListData();
  };

  const handleDeleteMandalart = async (id: string) => {
    if (!confirm('이 만다라트를 삭제하시겠습니까?')) return;

    const userId = sessionStorage.getItem('userId') || '';
    try {
      const res = await fetch(`${BASE_URL}/mandalart/deleteMandalartNodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandalartId: id, userId }),
      });
      if (!res.ok) {
        alert('삭제에 실패했습니다.');
        return;
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.');
      return;
    }

    if (selectedMandalart?.id === id) {
      setSelectedMandalart(null);
      setGrid(createEmptyGrid());
    }
    selectMandalartListData();
  };

  const handleSelectMandalart = async (mandalart: Mandalart) => {
    setSelectedMandalart(mandalart);
    setIsLoading(true);

    const userId = sessionStorage.getItem('userId') || '';
    const params = new URLSearchParams({ mandalartId: mandalart.id, userId });

    try {
      const res = await fetch(`${BASE_URL}/mandalart/selectMandalartNodeList?${params}`);
      if (res.ok) {
        const nodes = await res.json();
        setGrid(nodesToGrid(nodes));
      } else {
        setGrid(createEmptyGrid());
      }
    } catch {
      setGrid(createEmptyGrid());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      <style>{`
        .mandalart-cell:empty:before {
          content: attr(data-placeholder);
          color: #6B7280;
          opacity: 0.8;
        }
        .mandalart-cell:focus:before {
          content: '';
        }
      `}</style>

      {/* 왼쪽: 만다라트 목록 */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg dark:text-white">만다라트 목록</h3>
          <button
            onClick={handleAddNewMandalart}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="새 만다라트 작성"
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
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">시작일</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">종료일</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <div className="text-xs text-gray-600 dark:text-gray-400 pt-2">
              총 {mandalarts.length}개의 만다라트
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {Object.keys(groupedMandalarts)
            .sort((a, b) => b.localeCompare(a))
            .map((date) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="size-4" />
                  <span>{date}</span>
                </div>
                <div className="space-y-2">
                  {groupedMandalarts[date].map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedMandalart?.id === item.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                      onClick={() => handleSelectMandalart(item)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDeleteMandalart(item.id);
                          }}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {mandalarts.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>
                {dateFilter.startDate || dateFilter.endDate
                  ? '해당 기간에 만다라트가 없습니다.'
                  : '만다라트가 없습니다.'}
              </p>
              <p className="text-sm mt-2">
                {dateFilter.startDate || dateFilter.endDate
                  ? '다른 기간을 선택해보세요.'
                  : '새 만다라트를 작성해보세요!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 만다라트 그리드 */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        {selectedMandalart ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl dark:text-white">{selectedMandalart.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCurrentMandalart}
                    className="px-4 py-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2 border border-blue-300 dark:border-blue-700"
                  >
                    <Save className="size-4" />
                    저장
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 border border-red-300 dark:border-red-700"
                  >
                    <RotateCcw className="size-4" />
                    초기화
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto p-6">
              {isLoading ? (
                <div className="text-gray-500 dark:text-gray-400">불러오는 중...</div>
              ) : (
                <div className="inline-block">
                  <div className="grid grid-cols-9 gap-0 border-2 border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800">
                    {grid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        const isThickBorderRight = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                        const isThickBorderBottom = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                        const isSubGoalCenter = rowIndex % 3 === 1 && colIndex % 3 === 1;
                        const isMainGoal = rowIndex === 4 && colIndex === 4;
                        const isCenterArea = rowIndex >= 3 && rowIndex <= 5 && colIndex >= 3 && colIndex <= 5;
                        const isEditable = isActionCellEditable(rowIndex, colIndex);

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`
                              relative
                              ${isThickBorderRight ? 'border-r-2 border-r-gray-400 dark:border-r-gray-500' : 'border-r border-r-gray-300 dark:border-r-gray-600'}
                              ${isThickBorderBottom ? 'border-b-2 border-b-gray-400 dark:border-b-gray-500' : 'border-b border-b-gray-300 dark:border-b-gray-600'}
                            `}
                          >
                            <div
                              contentEditable={isEditable}
                              suppressContentEditableWarning
                              onBlur={(e: React.FocusEvent<HTMLDivElement>) => handleCellChange(rowIndex, colIndex, e.currentTarget.textContent || '')}
                              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                }
                              }}
                              className={`
                                w-24 h-24 p-2
                                ${isMainGoal ? 'text-base' : (isSubGoalCenter || isCenterArea) ? 'text-sm' : 'text-xs'}
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
                                flex items-center justify-center text-center
                                overflow-hidden break-words
                                ${getCellColor(rowIndex, colIndex)}
                                ${getCellTextColor(rowIndex, colIndex)}
                                ${isMainGoal ? 'font-bold' : ''}
                                ${isSubGoalCenter || isCenterArea ? 'font-semibold' : ''}
                                ${!isEditable ? 'opacity-40 cursor-not-allowed' : 'cursor-text'}
                                mandalart-cell
                              `}
                              data-placeholder={
                                isMainGoal ? '메인 목표' :
                                isSubGoalCenter ? '하위 목표' :
                                isCenterArea ? '하위 목표' :
                                '실행 계획'
                              }
                              style={{ minHeight: '96px', wordBreak: 'break-word' }}
                            >
                              {cell.value}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 범례 */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-6 text-sm dark:text-gray-300">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 ${COLORS.center} border-2`}></div>
                <span>메인 목표</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 ${COLORS.subGoal} border-2`}></div>
                <span>하위 목표</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 ${COLORS.action} border-2`}></div>
                <span>실행 계획</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg">만다라트를 선택하거나 새로 작성해보세요</p>
              <button
                onClick={handleAddNewMandalart}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="size-5" />새 만다라트 작성
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
