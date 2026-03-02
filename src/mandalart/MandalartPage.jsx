import { useState } from 'react';
import { Save, RotateCcw, Download } from 'lucide-react';

const COLORS = {
  center: 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700',
  subGoal: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700',
  action: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600',
  centerText: 'text-blue-900 dark:text-blue-200',
  subGoalText: 'text-purple-900 dark:text-purple-200',
  actionText: 'text-gray-700 dark:text-gray-300',
};

export function MandalartPage() {
  const [grid, setGrid] = useState(
    Array(9).fill(null).map(() => 
      Array(9).fill(null).map(() => ({ value: '' }))
    )
  );

  const handleCellChange = (row, col, value) => {
    const newGrid = grid.map((r, i) => 
      r.map((cell, j) => 
        i === row && j === col ? { value } : cell
      )
    );
    setGrid(newGrid);

    // 중앙 셀의 하위 목표가 변경되면 해당하는 외곽 영역의 중앙에도 복사
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5 && !(row === 4 && col === 4)) {
      const subRow = row - 3; // 0, 1, 2
      const subCol = col - 3; // 0, 1, 2
      
      // 외곽 영역의 중앙 위치 계산
      const targetRow = subRow * 3 + 1;
      const targetCol = subCol * 3 + 1;
      
      newGrid[targetRow][targetCol] = { value };
    }
    
    setGrid(newGrid);
  };

  const getCellColor = (row, col) => {
    // 중앙 메인 목표 (4, 4)
    if (row === 4 && col === 4) {
      return COLORS.center;
    }
    
    // 중앙 3x3 영역의 8개 하위 목표
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
      return COLORS.subGoal;
    }
    
    // 각 외곽 3x3 영역의 중앙 (하위 목표가 복사된 곳)
    const isSubGoalCenter = (row % 3 === 1) && (col % 3 === 1);
    if (isSubGoalCenter) {
      return COLORS.subGoal;
    }
    
    // 나머지 실행 계획 셀
    return COLORS.action;
  };

  const getCellTextColor = (row, col) => {
    if (row === 4 && col === 4) {
      return COLORS.centerText;
    }
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) {
      return COLORS.subGoalText;
    }
    const isSubGoalCenter = (row % 3 === 1) && (col % 3 === 1);
    if (isSubGoalCenter) {
      return COLORS.subGoalText;
    }
    return COLORS.actionText;
  };

  // 실행 계획 셀이 편집 가능한지 확인 (해당 블록의 하위 목표가 있는지 확인)
  const isActionCellEditable = (row, col) => {
    // 메인 목표는 항상 편집 가능
    if (row === 4 && col === 4) return true;
    
    // 중앙 영역의 하위 목표는 항상 편집 가능
    if (row >= 3 && row <= 5 && col >= 3 && col <= 5) return true;
    
    // 하위 목표 중앙 셀은 항상 편집 가능
    const isSubGoalCenter = (row % 3 === 1) && (col % 3 === 1);
    if (isSubGoalCenter) return true;
    
    // 실행 계획 셀: 해당 블록의 중앙(하위 목표)에 값이 있는지 확인
    const blockCenterRow = Math.floor(row / 3) * 3 + 1;
    const blockCenterCol = Math.floor(col / 3) * 3 + 1;
    
    return grid[blockCenterRow][blockCenterCol].value.trim() !== '';
  };

  const handleReset = () => {
    if (confirm('모든 내용을 초기화하시겠습니까?')) {
      setGrid(Array(9).fill(null).map(() => 
        Array(9).fill(null).map(() => ({ value: '' }))
      ));
    }
  };

  const handleExport = () => {
    const text = grid.map((row, i) => 
      row.map((cell, j) => cell.value || '-').join('\t')
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mandalart_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    localStorage.setItem('mandalart_grid', JSON.stringify(grid));
    alert('저장되었습니다!');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('mandalart_grid');
    if (saved) {
      setGrid(JSON.parse(saved));
      alert('불러오기 완료!');
    } else {
      alert('저장된 데이터가 없습니다.');
    }
  };

  return (
    <div className="h-full flex flex-col">
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

      {/* 상단 설명 및 버튼 */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl mb-2 dark:text-white">만다라트</h2>
            {/*
            <p className="text-gray-600">
              중앙에 메인 목표를 입력하고, 주변 8개 칸에 하위 목표를 작성하세요.
              <br />
              각 하위 목표는 외곽 영역의 중심이 되어 8가지 실행 계획을 세울 수 있습니다.
            </p>
            */}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 border border-blue-300 dark:border-blue-700"
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

      {/* 만다라트 그리드 */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="inline-block">
          <div className="grid grid-cols-9 gap-0 border-2 border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800">
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const isThickBorderRight = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                const isThickBorderBottom = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                const isSubGoalCenter = (rowIndex % 3 === 1) && (colIndex % 3 === 1);
                const isMainGoal = rowIndex === 4 && colIndex === 4;
                const isCenterArea = rowIndex >= 3 && rowIndex <= 5 && colIndex >= 3 && colIndex <= 5;
                const isEditable = isActionCellEditable(rowIndex, colIndex);
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      relative
                      ${isThickBorderRight ? 'border-r-2 border-r-gray-400' : 'border-r border-r-gray-300'}
                      ${isThickBorderBottom ? 'border-b-2 border-b-gray-400' : 'border-b border-b-gray-300'}
                    `}
                  >
                    <div
                      contentEditable={isEditable}
                      suppressContentEditableWarning
                      onBlur={(e) => handleCellChange(rowIndex, colIndex, e.currentTarget.textContent || '')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                        }
                      }}
                      className={`
                        w-24 h-24 p-2 text-xs
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
                      style={{
                        minHeight: '96px',
                        wordBreak: 'break-word',
                      }}
                    >
                      {cell.value}
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-6 flex items-center gap-6 text-sm dark:text-gray-300">
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
    </div>
  );
}