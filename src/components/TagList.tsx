import React from 'react';
import { Tag } from '../types';
import { Edit, Trash2, Plus } from 'lucide-react';

interface TagListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
  onSelect: (tag: Tag) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onEdit, onDelete, onSelect }) => {
  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个标签吗？')) {
      onDelete(id);
    }
  };

  return (
    <div className="h-[calc(100vh-400px)] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white rounded-lg shadow-md overflow-hidden notion-style flex flex-col">
            {tag.imageUrl ? (
              <img src={tag.imageUrl} alt={tag.name} className="w-full h-24 object-cover" />
            ) : (
              <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">无图片</span>
              </div>
            )}
            <div className="p-2 flex-grow">
              <h3 className="text-sm font-bold text-blue-600 mb-1 pb-1 border-b border-blue-300">{tag.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{tag.translation}</p>
              <p className="text-xs text-gray-500 mb-1">{tag.mainCategory} / {tag.subCategory}</p>
            </div>
            <div className="px-2 pb-2 flex justify-center items-center space-x-1">
              <button
                onClick={() => onSelect(tag)}
                className="p-1 rounded-md border border-green-300 text-green-600 hover:bg-green-100 transition-colors duration-200"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => onEdit(tag)}
                className="p-1 rounded-md border border-indigo-300 text-indigo-600 hover:bg-indigo-100 transition-colors duration-200"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-1 rounded-md border border-red-300 text-red-600 hover:bg-red-100 transition-colors duration-200"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagList;