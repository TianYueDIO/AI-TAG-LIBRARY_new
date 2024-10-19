import React, { useState, KeyboardEvent } from 'react';
import { Category } from '../types';
import { X, Trash2, Edit2, Check, Pencil } from 'lucide-react';

interface CategoryViewProps {
  categories: Category[];
  selectedMainCategory: string;
  selectedSubCategory: string;
  onSelectMainCategory: (category: string) => void;
  onSelectSubCategory: (category: string) => void;
  onDeleteCategory: (mainCategory: string, subCategory?: string) => void;
  onUpdateCategory: (oldName: string, newName: string, isMainCategory: boolean) => void;
}

const CategoryView: React.FC<CategoryViewProps> = ({
  categories,
  selectedMainCategory,
  selectedSubCategory,
  onSelectMainCategory,
  onSelectSubCategory,
  onDeleteCategory,
  onUpdateCategory
}) => {
  const [deleteMode, setDeleteMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string; isMain: boolean } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const activeSubCategories = selectedMainCategory === 'all'
    ? []
    : ['all', ...(categories.find(cat => cat.main === selectedMainCategory)?.sub || [])];

  const handleEditStart = (categoryName: string, isMain: boolean) => {
    setEditingCategory({ name: categoryName, isMain });
    setNewCategoryName(categoryName);
  };

  const handleEditSubmit = () => {
    if (editingCategory && newCategoryName.trim() !== '') {
      onUpdateCategory(editingCategory.name, newCategoryName.trim(), editingCategory.isMain);
      setEditingCategory(null);
      setNewCategoryName('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (deleteMode) setDeleteMode(false);
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    if (editMode) setEditMode(false);
    setEditingCategory(null);
    setNewCategoryName('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">分类管理</h2>
        <div className="flex space-x-2">
          <button
            onClick={toggleEditMode}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
              editMode ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Pencil className="mr-1" size={16} />
            {editMode ? '退出编辑' : '编辑模式'}
          </button>
          <button
            onClick={toggleDeleteMode}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
              deleteMode ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <Trash2 className="mr-1" size={16} />
            {deleteMode ? '退出删除' : '删除模式'}
          </button>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto flex-grow">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectMainCategory('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left ${
              selectedMainCategory === 'all'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <div key={category.main} className="relative">
              {editMode && editingCategory?.name === category.main ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="px-2 py-1 rounded-lg text-sm border-2 border-yellow-500 focus:outline-none w-full"
                  />
                  <button
                    onClick={handleEditSubmit}
                    className="ml-1 bg-green-500 text-white rounded-full p-1 hover:bg-green-600"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectMainCategory(category.main)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left ${
                    selectedMainCategory === category.main
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {category.main}
                </button>
              )}
              {editMode && editingCategory?.name !== category.main && (
                <button
                  onClick={() => handleEditStart(category.main, true)}
                  className="absolute top-1 right-1 bg-yellow-500 text-white rounded-full p-0.5 hover:bg-yellow-600"
                >
                  <Edit2 size={12} />
                </button>
              )}
              {deleteMode && (
                <button
                  onClick={() => onDeleteCategory(category.main)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {selectedMainCategory !== 'all' && (
          <>
            <div className="w-full h-px bg-gray-300"></div>
            <div className="flex flex-col gap-2">
              {activeSubCategories.map((subCategory) => (
                <div key={subCategory} className="relative">
                  {editMode && editingCategory?.name === subCategory ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="px-2 py-1 rounded-full text-xs border-2 border-yellow-500 focus:outline-none w-full"
                      />
                      <button
                        onClick={handleEditSubmit}
                        className="ml-1 bg-green-500 text-white rounded-full p-1 hover:bg-green-600"
                      >
                        <Check size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectSubCategory(subCategory)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 w-full text-left ${
                        selectedSubCategory === subCategory
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {subCategory === 'all' ? '全部' : subCategory}
                    </button>
                  )}
                  {editMode && subCategory !== 'all' && editingCategory?.name !== subCategory && (
                    <button
                      onClick={() => handleEditStart(subCategory, false)}
                      className="absolute top-1 right-1 bg-yellow-500 text-white rounded-full p-0.5 hover:bg-yellow-600"
                    >
                      <Edit2 size={10} />
                    </button>
                  )}
                  {deleteMode && subCategory !== 'all' && (
                    <button
                      onClick={() => onDeleteCategory(selectedMainCategory, subCategory)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryView;