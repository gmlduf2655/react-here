import { Clock, X } from 'lucide-react';
import type { BrainDumpItem } from './timeBoxPage';

interface BrainDumpSelectModalProps {
  isOpen: boolean;
  timeSlotInfo: { hour: number; startMinute: number } | null;
  brainDumps: BrainDumpItem[];
  selectedIds: string[];
  onClose: () => void;
  onConfirm: () => void;
  onToggleItem: (id: string) => void;
}

export function BrainDumpSelectModal({
  isOpen,
  timeSlotInfo,
  brainDumps,
  selectedIds,
  onClose,
  onConfirm,
  onToggleItem,
}: BrainDumpSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">
            TIME TABLE에 추가
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 시간 표시 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              선택된 시간
            </label>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm dark:text-gray-200">
                <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">
                  {String(timeSlotInfo?.hour || 0).padStart(2, '00')}:
                  {String(timeSlotInfo?.startMinute || 0).padStart(2, '0')}{' '}
                  -{' '}
                  {timeSlotInfo?.startMinute === 0
                    ? String(timeSlotInfo?.hour || 0).padStart(2, '0')
                    : String((timeSlotInfo?.hour || 0) + 1).padStart(2, '0')}:
                  {timeSlotInfo?.startMinute === 0 ? '30' : '00'}
                </span>
              </div>
            </div>
          </div>

          {/* BRAIN DUMP 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              BRAIN DUMP 선택 (복수 선택 가능)
            </label>
            <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              <div className="space-y-1">
                {brainDumps.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-colors ${
                      selectedIds.includes(item.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 size-5 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedIds.includes(item.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <div className="size-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </span>
                      </div>
                      <div
                        className={`text-sm ${
                          selectedIds.includes(item.id)
                            ? 'font-medium dark:text-white'
                            : 'dark:text-gray-200'
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {selectedIds.length === 0 ? (
              <div className="mt-2 text-xs text-red-500">
                최소 1개 항목을 선택해주세요
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{selectedIds.length}개 항목 선택됨</span>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              TIME TABLE에 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
