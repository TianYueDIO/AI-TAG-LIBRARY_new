import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Copy, Weight, Hash, Check, Trash2 } from 'lucide-react';
import { Tag } from '../types';

interface TagDisplayProps {
  selectedTags: Tag[];
  onRemove: (tag: Tag) => void;
  manualInput: string;
  onManualInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManualInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCopyTags: () => void;
  weightedMode: boolean;
  setWeightedMode: (mode: boolean) => void;
  tagWeights: Record<string, number>;
  setTagWeights: (weights: Record<string, number>) => void;
  matchedTags: Tag[];
  onSelectMatchedTag: (tag: Tag) => void;
  onReorderTags: (newOrder: Tag[]) => void;
  onClearAllTags: () => void;
}

const TagDisplay: React.FC<TagDisplayProps> = ({
  selectedTags,
  onRemove,
  manualInput,
  onManualInputChange,
  onManualInputKeyDown,
  onCopyTags,
  weightedMode,
  setWeightedMode,
  tagWeights,
  setTagWeights,
  matchedTags,
  onSelectMatchedTag,
  onReorderTags,
  onClearAllTags,
}) => {
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [selectedMatchedTagIndex, setSelectedMatchedTagIndex] = useState<number>(-1);
  const [showMatchedTags, setShowMatchedTags] = useState(false);
  const [draggedTagIndex, setDraggedTagIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const weightChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matchedTagsRef = useRef<HTMLDivElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const clearConfirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValues(
      Object.fromEntries(
        Object.entries(tagWeights).map(([id, weight]) => [
          id,
          weight.toString(),
        ])
      )
    );
  }, [tagWeights]);

  useEffect(() => {
    setShowMatchedTags(matchedTags.length > 0);
  }, [matchedTags]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        matchedTagsRef.current &&
        !matchedTagsRef.current.contains(event.target as Node)
      ) {
        setShowMatchedTags(false);
        setSelectedMatchedTagIndex(-1);
      }

      // Only hide clear confirm if click is outside both the button and confirm dialog
      const clearButton = clearButtonRef.current;
      const clearConfirm = document.getElementById('clear-confirm-dialog');
      if (
        clearButton &&
        clearConfirm &&
        !clearButton.contains(event.target as Node) &&
        !clearConfirm.contains(event.target as Node)
      ) {
        if (clearConfirmTimeoutRef.current) {
          clearTimeout(clearConfirmTimeoutRef.current);
        }
        clearConfirmTimeoutRef.current = setTimeout(() => {
          setShowClearConfirm(false);
        }, 300); // Small delay to prevent accidental hiding
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (clearConfirmTimeoutRef.current) {
        clearTimeout(clearConfirmTimeoutRef.current);
      }
    };
  }, []);

  const getWeightColor = useCallback((weight: number) => {
    const colors = [
      'bg-gray-100 text-gray-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
    ];
    return colors[Math.min(weight, colors.length - 1)];
  }, []);

  const handleWeightChange = useCallback(
    (tagId: string, increment: boolean) => {
      if (weightedMode) {
        setTagWeights((prev) => {
          const currentWeight = prev[tagId] || 0;
          const newWeight = increment
            ? currentWeight + 1
            : Math.max(currentWeight - 1, 0);
          return { ...prev, [tagId]: newWeight };
        });

        setInputValues((prev) => {
          const currentWeight = parseInt(prev[tagId] || '0');
          const newWeight = increment
            ? currentWeight + 1
            : Math.max(currentWeight - 1, 0);
          return { ...prev, [tagId]: newWeight.toString() };
        });

        if (weightChangeTimeoutRef.current) {
          clearTimeout(weightChangeTimeoutRef.current);
        }

        weightChangeTimeoutRef.current = setTimeout(() => {
          setTagWeights((prev) => ({ ...prev }));
        }, 100);
      }
    },
    [weightedMode, setTagWeights]
  );

  const handleTagMouseDown = useCallback(
    (e: React.MouseEvent, tagId: string) => {
      if (weightedMode) {
        e.preventDefault();
        const increment = e.button === 0;
        handleWeightChange(tagId, increment);

        longPressTimerRef.current = setInterval(() => {
          handleWeightChange(tagId, increment);
        }, 200);
      }
    },
    [weightedMode, handleWeightChange]
  );

  const handleTagMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearInterval(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleTagMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleTagMouseUp);
      if (weightChangeTimeoutRef.current) {
        clearTimeout(weightChangeTimeoutRef.current);
      }
    };
  }, [handleTagMouseUp]);

  const handleDirectWeightInput = useCallback(
    (e: React.MouseEvent, tagId: string) => {
      e.stopPropagation();
      if (weightedMode) {
        setEditingTagId(tagId);
        setInputValues((prev) => ({
          ...prev,
          [tagId]: (tagWeights[tagId] || 0).toString(),
        }));
      }
    },
    [weightedMode, tagWeights]
  );

  const handleWeightInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, tagId: string) => {
      const inputValue = e.target.value;
      setInputValues((prev) => ({ ...prev, [tagId]: inputValue }));

      if (inputValue === '') {
        setTagWeights((prev) => ({ ...prev, [tagId]: 0 }));
      } else {
        const newWeight = parseInt(inputValue);
        if (!isNaN(newWeight) && newWeight >= 0) {
          setTagWeights((prev) => ({ ...prev, [tagId]: newWeight }));
        }
      }
    },
    [setTagWeights]
  );

  const handleWeightInputBlur = useCallback(
    (tagId: string) => {
      setEditingTagId(null);
      const finalWeight = tagWeights[tagId] || 0;
      setInputValues((prev) => ({ ...prev, [tagId]: finalWeight.toString() }));
    },
    [tagWeights]
  );

  const handleWeightInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, tagId: string) => {
      if (e.key === 'Enter') {
        handleWeightInputBlur(tagId);
      } else if (
        e.key === 'Backspace' &&
        (tagWeights[tagId] === 0 || inputValues[tagId] === '0')
      ) {
        e.preventDefault();
        setTagWeights((prev) => ({ ...prev, [tagId]: 0 }));
        setInputValues((prev) => ({ ...prev, [tagId]: '0' }));
      }
    },
    [tagWeights, inputValues, handleWeightInputBlur, setTagWeights]
  );

  const handleCopyWithMessage = useCallback(() => {
    onCopyTags();
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 2000);
  }, [onCopyTags]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matchedTags.length > 0 && showMatchedTags) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMatchedTagIndex((prev) => (prev + 1) % matchedTags.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMatchedTagIndex(
          (prev) => (prev - 1 + matchedTags.length) % matchedTags.length
        );
      } else if (e.key === 'Enter' && selectedMatchedTagIndex !== -1) {
        e.preventDefault();
        e.stopPropagation();
        onSelectMatchedTag(matchedTags[selectedMatchedTagIndex]);
        setShowMatchedTags(false);
        setSelectedMatchedTagIndex(-1);
        return;
      } else if (e.key === 'Escape') {
        setShowMatchedTags(false);
        setSelectedMatchedTagIndex(-1);
      }
    }
    onManualInputKeyDown(e);
  };

  const handleInputFocus = () => {
    setShowMatchedTags(matchedTags.length > 0);
  };

  const handleMatchedTagClick = (tag: Tag, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectMatchedTag(tag);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isTagSelected = useCallback(
    (tag: Tag) => {
      return selectedTags.some((selectedTag) => selectedTag.id === tag.id);
    },
    [selectedTags]
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedTagIndex(index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedTagIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedTagIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isAfter = x > rect.width / 2;
    
    setDragOverIndex(isAfter ? index + 1 : index);
  };

  const handleDropZoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedTagIndex === null) return;
    setDragOverIndex(selectedTags.length);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Don't reset dragOverIndex here to maintain the preview
    // Only reset if leaving the entire tags container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (dragIndex !== dropIndex && draggedTagIndex !== null) {
      const newTags = [...selectedTags];
      const [removed] = newTags.splice(dragIndex, 1);
      
      // Adjust the insertion index if dropping after the drag source
      const adjustedDropIndex = dropIndex > dragIndex ? dropIndex - 1 : dropIndex;
      newTags.splice(adjustedDropIndex, 0, removed);
      
      onReorderTags(newTags);
    }
    
    setDraggedTagIndex(null);
    setDragOverIndex(null);
  };

  const handleClearButtonClick = () => {
    setShowClearConfirm(true);
    if (clearConfirmTimeoutRef.current) {
      clearTimeout(clearConfirmTimeoutRef.current);
      clearConfirmTimeoutRef.current = null;
    }
  };

  const handleClearButtonMouseEnter = () => {
    if (clearConfirmTimeoutRef.current) {
      clearTimeout(clearConfirmTimeoutRef.current);
      clearConfirmTimeoutRef.current = null;
    }
    setShowClearConfirm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">已选标签</h2>
        {selectedTags.length > 0 && (
          <div className="relative">
            <button
              ref={clearButtonRef}
              onClick={handleClearButtonClick}
              onMouseEnter={handleClearButtonMouseEnter}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-1"
              title="清空所有标签"
            >
              <Trash2 size={16} />
              清空
            </button>
            {showClearConfirm && (
              <div
                id="clear-confirm-dialog"
                className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50"
              >
                <p className="text-sm text-gray-600 mb-2">确定要删除所有已选标签吗？</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      onClearAllTags();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    确定
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3 relative min-h-[2.5rem]">
        {selectedTags.map((tag, index) => (
          <div
            key={tag.id}
            className="relative"
          >
            {index === dragOverIndex && (
              <div className="absolute inset-y-0 -left-2 w-1 bg-blue-500 rounded-full" />
            )}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onMouseDown={(e) => weightedMode && handleTagMouseDown(e, tag.id)}
              onContextMenu={(e) => e.preventDefault()}
              className={`px-2 py-1 rounded-full text-sm flex items-center transition-all duration-200 select-none ${
                getWeightColor(tagWeights[tag.id] || 0)
              } ${weightedMode ? 'cursor-pointer' : 'cursor-grab'} hover:cursor-grab active:cursor-grabbing
                ${draggedTagIndex === index ? 'opacity-50' : 'opacity-100'}
              `}
            >
              <span>
                {'{'.repeat(tagWeights[tag.id] || 0)}
                {tag.name}
                {'}'.repeat(tagWeights[tag.id] || 0)} ({tag.translation})
              </span>
              <div className="flex items-center ml-1">
                {weightedMode &&
                  (editingTagId === tag.id ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={inputValues[tag.id] || '0'}
                      onChange={(e) => handleWeightInputChange(e, tag.id)}
                      onBlur={() => handleWeightInputBlur(tag.id)}
                      onKeyDown={(e) => handleWeightInputKeyDown(e, tag.id)}
                      className="w-12 h-6 text-xs text-center border rounded"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={(e) => handleDirectWeightInput(e, tag.id)}
                      className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <Hash size={18} />
                    </button>
                  ))}
                <button
                  onClick={() => onRemove(tag)}
                  className="p-1 ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {/* Drop zone for the end position */}
        <div
          ref={dropZoneRef}
          className={`flex-grow min-w-[50px] h-8 rounded-md transition-all duration-200 ${
            draggedTagIndex !== null ? 'bg-gray-100' : ''
          }`}
          onDragOver={handleDropZoneDragOver}
          onDrop={(e) => handleDrop(e, selectedTags.length)}
        >
          {dragOverIndex === selectedTags.length && (
            <div className="absolute inset-y-0 -left-1 w-1 bg-blue-500 rounded-full" />
          )}
        </div>
      </div>

      <div className="flex flex-col mb-3">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={manualInput}
            onChange={onManualInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder="手动输入标签..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={() => setWeightedMode(!weightedMode)}
            className={`px-4 py-2 ${
              weightedMode ? 'bg-indigo-600' : 'bg-gray-300'
            } text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            title={weightedMode ? '禁用权重模式' : '启用权重模式'}
          >
            <Weight size={18} />
          </button>
          <button
            onClick={handleCopyWithMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Copy size={18} />
          </button>
        </div>
        {showMatchedTags && matchedTags.length > 0 && (
          <div
            ref={matchedTagsRef}
            className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm absolute z-10 w-full"
          >
            {matchedTags.map((tag, index) => (
              <div
                key={tag.id}
                className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                  index === selectedMatchedTagIndex ? 'bg-gray-100' : ''
                }`}
                onClick={(e) => handleMatchedTagClick(tag, e)}
                onMouseEnter={() => setSelectedMatchedTagIndex(index)}
              >
                <Check
                  size={16}
                  className={`mr-2 ${
                    isTagSelected(tag) ? 'text-green-500' : 'text-transparent'
                  }`}
                />
                <span>
                  {tag.name} ({tag.translation})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCopyMessage && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-green-500 text-white rounded-md shadow-md transition-opacity duration-300">
          标签已复制到剪贴板
        </div>
      )}
    </div>
  );
};

export default TagDisplay;