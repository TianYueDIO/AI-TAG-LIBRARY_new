import React, { useState, useEffect } from 'react';
import { TagFormData, Category } from '../types';
import { Plus, Upload, X } from 'lucide-react';

interface TagFormProps {
  onSubmit: (data: TagFormData) => void;
  categories: Category[];
  initialData?: TagFormData;
  onCancel: () => void;
}

const TagForm: React.FC<TagFormProps> = ({ onSubmit, categories, initialData, onCancel }) => {
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    translation: '',
    mainCategory: '',
    subCategory: '',
    imageUrl: '',
  });
  const [imageInputType, setImageInputType] = useState<'file' | 'url'>('file');
  const [newMainCategory, setNewMainCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset subCategory when mainCategory changes
    if (name === 'mainCategory') {
      setFormData((prev) => ({ ...prev, subCategory: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submittedData = {
      ...formData,
      mainCategory: formData.mainCategory === 'new' ? newMainCategory : formData.mainCategory,
      subCategory: formData.subCategory === 'new' ? newSubCategory : formData.subCategory,
    };
    onSubmit(submittedData);
    setFormData({ name: '', translation: '', mainCategory: '', subCategory: '', imageUrl: '' });
    setNewMainCategory('');
    setNewSubCategory('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md notion-style">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{initialData ? '编辑标签' : '添加新标签'}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          标签名称
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="translation" className="block text-sm font-medium text-gray-700">
          翻译
        </label>
        <input
          type="text"
          id="translation"
          name="translation"
          value={formData.translation}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700">
          主分类
        </label>
        <select
          id="mainCategory"
          name="mainCategory"
          value={formData.mainCategory}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">选择主分类</option>
          {categories.map((category) => (
            <option key={category.main} value={category.main}>
              {category.main}
            </option>
          ))}
          <option value="new">新建主分类</option>
        </select>
      </div>
      {formData.mainCategory === 'new' && (
        <div>
          <label htmlFor="newMainCategory" className="block text-sm font-medium text-gray-700">
            新主分类名称
          </label>
          <input
            type="text"
            id="newMainCategory"
            value={newMainCategory}
            onChange={(e) => setNewMainCategory(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      )}
      <div>
        <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
          子分类
        </label>
        <select
          id="subCategory"
          name="subCategory"
          value={formData.subCategory}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">选择子分类</option>
          {categories
            .find((category) => category.main === formData.mainCategory)
            ?.sub.map((subCategory) => (
              <option key={subCategory} value={subCategory}>
                {subCategory}
              </option>
            ))}
          <option value="new">新建子分类</option>
        </select>
      </div>
      {formData.subCategory === 'new' && (
        <div>
          <label htmlFor="newSubCategory" className="block text-sm font-medium text-gray-700">
            新子分类名称
          </label>
          <input
            type="text"
            id="newSubCategory"
            value={newSubCategory}
            onChange={(e) => setNewSubCategory(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">图片</label>
        <div className="mt-2">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setImageInputType('file')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                imageInputType === 'file'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              上传文件
            </button>
            <button
              type="button"
              onClick={() => setImageInputType('url')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                imageInputType === 'url'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              输入URL
            </button>
          </div>
          {imageInputType === 'file' ? (
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full"
            />
          ) : (
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleImageUrlChange}
              placeholder="输入图片URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          )}
        </div>
        {formData.imageUrl && (
          <img src={formData.imageUrl} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md" />
        )}
      </div>
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="mr-2 h-4 w-4" />
        {initialData ? '更新标签' : '添加标签'}
      </button>
    </form>
  );
};

export default TagForm;