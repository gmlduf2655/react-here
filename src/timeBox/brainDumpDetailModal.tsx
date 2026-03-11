import { X } from "lucide-react";
import type { BrainDumpItem } from "./timeBoxPage";
import { useEffect, useState } from "react";

const hours = Array.from({ length: 24 }, (_, i) => i);

const predefinedColors = [
  { name: "파란색", color: "#3b82f6" },
  { name: "초록색", color: "#10b981" },
  { name: "노란색", color: "#f59e0b" },
  { name: "빨간색", color: "#ef4444" },
  { name: "보라색", color: "#8b5cf6" },
  { name: "핑크색", color: "#ec4899" },
  { name: "청록색", color: "#14b8a6" },
  { name: "주황색", color: "#f97316" },
];

interface BrainDumpDetailModalProps {
  isOpen: boolean;
  brainDumpItem: BrainDumpItem | null;
  selectedTimeSlots: string[];
  color: string;
  onClose: () => void;
  onSave: () => void;
  onToggleTimeSlot: (hour: number, minute: number) => void;
  onColorChange: (color: string) => void;
}

export function BrainDumpDetailModal({
  isOpen,
  brainDumpItem,
  selectedTimeSlots,
  color,
  onClose,
  onSave,
  onToggleTimeSlot,
  onColorChange,
}: BrainDumpDetailModalProps) {
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dumpContent, setDumpContent] = useState("");
  const [completeYn, setCompleteYn] = useState(false);

  // 모달 열릴 때 위치 초기화
  useEffect(() => {
    if (isOpen) {
      setModalPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setIsDragging(false);
    }
  }, [isOpen]);

  // 드래그 이벤트
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setModalPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 드래그 핸들러
  const handleModalMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".modal-header")) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y,
      });
    }
  };

  const isTimeSlotSelected = (hour: number, minute: number) =>
    selectedTimeSlots.includes(`${hour}-${minute}`);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[900px] max-w-[90vw] overflow-hidden"
        style={{
          position: "absolute",
          left: modalPosition.x,
          top: modalPosition.y,
          transform: "translate(-50%, -50%)",
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <div
          className="modal-header flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-gray-700 cursor-grab active:cursor-grabbing border-b border-gray-200 dark:border-gray-600"
          onMouseDown={handleModalMouseDown}
        >
          <h3 className="text-lg font-semibold dark:text-white">
            BRAIN DUMP 상세 정보
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-6 pb-0">
          {/* 선택된 brain dump 표시 */}
          {brainDumpItem && (
            <>   
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>                   
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                {brainDumpItem.text}
              </p>
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6 p-6 pt-3">
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
                            onChange={() => onToggleTimeSlot(hour, 0)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm dark:text-gray-300">
                            {String(hour).padStart(2, "0")}:00 -{" "}
                            {String(hour).padStart(2, "0")}:30
                          </span>
                        </label>
                        <label className="flex-1 flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={isTimeSlotSelected(hour, 30)}
                            onChange={() => onToggleTimeSlot(hour, 30)}
                            className="cursor-pointer"
                          />
                          <span className="text-sm dark:text-gray-300">
                            {String(hour).padStart(2, "0")}:30 -{" "}
                            {String(hour + 1).padStart(2, "0")}:00
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
                    <span className="font-medium">
                      {selectedTimeSlots.length}개 시간대 선택됨
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedTimeSlots
                        .sort((a, b) => {
                          const [aH, aM] = a.split("-").map(Number);
                          const [bH, bM] = b.split("-").map(Number);
                          return aH === bH ? aM - bM : aH - bH;
                        })
                        .map((slot) => {
                          const [h, m] = slot.split("-").map(Number);
                          return (
                            <span
                              key={slot}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
                            >
                              {String(h).padStart(2, "0")}:
                              {String(m).padStart(2, "0")}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="text-red-500">
                    최소 1개의 시간대를 선택해주세요
                  </div>
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
                    onClick={() => onColorChange(colorOption.color)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      color === colorOption.color
                        ? "border-gray-900 dark:border-white scale-105"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: colorOption.color + "40" }}
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
          </div>

          {/* 오른쪽: 할 일 내용 */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                할 일 내용
              </label>
              {/* 완료 여부 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completeYn}
                  onChange={(e) => setCompleteYn(e.target.checked)}
                  className="size-5 cursor-pointer rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  완료됨
                </span>
              </label>
            </div>
            <textarea
              value={dumpContent}
              onChange={(e) => setDumpContent(e.target.value)}
              placeholder="할 일을 입력하세요..."
              className="flex-1 w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 p-6 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={selectedTimeSlots.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
