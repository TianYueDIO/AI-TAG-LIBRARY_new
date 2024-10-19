import React, { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Tag, TagFormData, Category } from './types';
import TagForm from './components/TagForm';
import TagList from './components/TagList';
import CategoryView from './components/CategoryView';
import TagDisplay from './components/TagDisplay';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [manualInput, setManualInput] = useState<string>('');
  const [weightedMode, setWeightedMode] = useState(false);
  const [tagWeights, setTagWeights] = useState<Record<string, number>>({});
  const [matchedTags, setMatchedTags] = useState<Tag[]>([]);

  useEffect(() => {
    // Simulated data fetching (replace with actual API calls in a real application)
    const mockCategories: Category[] = [
      { main: '技术', sub: ['计算机科学', '人工智能', '网络安全', '数据科学', '软件工程'] },
      { main: '艺术', sub: ['绘画', '音乐', '雕塑', '摄影', '设计'] },
      { main: '科学', sub: ['物理', '化学', '生物', '天文', '地质'] },
      { main: '文学', sub: ['小说', '诗歌', '散文', '戏剧', '评论'] },
    ];
    setCategories(mockCategories);

    const mockTags: Tag[] = [
      { id: '1', name: 'artificial intelligence', translation: '人工智能', mainCategory: '技术', subCategory: '人工智能' },
      { id: '2', name: 'machine learning', translation: '机器学习', mainCategory: '技术', subCategory: '人工智能' },
      { id: '3', name: 'deep learning', translation: '深度学习', mainCategory: '技术', subCategory: '人工智能' },
      { id: '4', name: 'neural networks', translation: '神经网络', mainCategory: '技术', subCategory: '人工智能' },
      { id: '5', name: 'computer vision', translation: '计算机视觉', mainCategory: '技术', subCategory: '计算机科学' },
      { id: '6', name: 'natural language processing', translation: '自然语言处理', mainCategory: '技术', subCategory: '人工智能' },
      { id: '7', name: 'data mining', translation: '数据挖掘', mainCategory: '技术', subCategory: '数据科学' },
      { id: '8', name: 'big data', translation: '大数据', mainCategory: '技术', subCategory: '数据科学' },
      { id: '9', name: 'cloud computing', translation: '云计算', mainCategory: '技术', subCategory: '计算机科学' },
      { id: '10', name: 'internet of things', translation: '物联网', mainCategory: '技术', subCategory: '网络安全' },
      { id: '11', name: 'blockchain', translation: '区块链', mainCategory: '技术', subCategory: '网络安全' },
      { id: '12', name: 'cybersecurity', translation: '网络安全', mainCategory: '技术', subCategory: '网络安全' },
      { id: '13', name: 'quantum computing', translation: '量子计算', mainCategory: '科学', subCategory: '物理' },
      { id: '14', name: 'robotics', translation: '机器人技术', mainCategory: '技术', subCategory: '软件工程' },
      { id: '15', name: 'virtual reality', translation: '虚拟现实', mainCategory: '技术', subCategory: '计算机科学' },
      { id: '16', name: 'augmented reality', translation: '增强现实', mainCategory: '技术', subCategory: '计算机科学' },
      { id: '17', name: '3D printing', translation: '3D打印', mainCategory: '技术', subCategory: '软件工程' },
      { id: '18', name: 'nanotechnology', translation: '纳米技术', mainCategory: '科学', subCategory: '物理' },
      { id: '19', name: 'biotechnology', translation: '生物技术', mainCategory: '科学', subCategory: '生物' },
      { id: '20', name: 'renewable energy', translation: '可再生能源', mainCategory: '科学', subCategory: '物理' },
    ];
    setTags(mockTags);
  }, []);

  const handleAddCategory = (mainCategory: string, subCategory?: string) => {
    setCategories(prevCategories => {
      let updatedCategories = [...prevCategories];
      const existingMainCategoryIndex = updatedCategories.findIndex(cat => cat.main === mainCategory);

      if (existingMainCategoryIndex === -1) {
        // If main category doesn't exist, add new main category
        updatedCategories.push({ main: mainCategory, sub: subCategory ? [subCategory] : [] });
      } else if (subCategory) {
        // If main category exists and there's a subcategory, add subcategory (if it doesn't already exist)
        if (!updatedCategories[existingMainCategoryIndex].sub.includes(subCategory)) {
          updatedCategories[existingMainCategoryIndex].sub.push(subCategory);
        }
      }

      return updatedCategories;
    });
  };

  const handleSubmit = (data: TagFormData) => {
    if (editingTag) {
      setTags(prevTags => prevTags.map(tag => tag.id === editingTag.id ? { ...tag, ...data } : tag));
    } else {
      const newTag: Tag = { ...data, id: Date.now().toString() };
      setTags(prevTags => [...prevTags, newTag]);
    }
    
    // Check and add new main category and subcategory
    handleAddCategory(data.mainCategory, data.subCategory);
    
    setShowForm(false);
    setEditingTag(null);
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setManualInput(input);
    if (input.trim() !== '') {
      const fuse = new Fuse(tags, {
        keys: ['name', 'translation'],
        threshold: 0.3,
      });
      const results = fuse.search(input).map(result => result.item);
      setMatchedTags(results);
    } else {
      setMatchedTags([]);
    }
  };

  const handleSelectMatchedTag = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag]);
      setTagWeights(prev => ({ ...prev, [tag.id]: 0 }));
    }
    setManualInput('');
    setMatchedTags([]);
  };

  const handleManualInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && manualInput.trim() !== '') {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: manualInput.trim(),
        translation: '',
        mainCategory: '',
        subCategory: ''
      };
      setSelectedTags(prev => [...prev, newTag]);
      setTagWeights(prev => ({ ...prev, [newTag.id]: 0 }));
      setManualInput('');
      setMatchedTags([]);
    }
  };

  const handleCopyTags = useCallback(() => {
    const tagString = selectedTags.map(tag => {
      const weight = tagWeights[tag.id] || 0;
      return '{'.repeat(weight) + tag.name + '}'.repeat(weight);
    }).join(', ');
    navigator.clipboard.writeText(tagString).then(() => {
      console.log('标签已复制到剪贴板！');
    }, (err) => {
      console.error('无法复制文本: ', err);
    });
  }, [selectedTags, tagWeights]);

  const handleSelectMainCategory = (category: string) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory('all');
  };

  const handleSelectSubCategory = (category: string) => {
    setSelectedSubCategory(category);
  };

  const handleDeleteCategory = (mainCategory: string, subCategory?: string) => {
    if (subCategory) {
      setCategories(categories.map(cat => 
        cat.main === mainCategory
          ? { ...cat, sub: cat.sub.filter(sub => sub !== subCategory) }
          : cat
      ));
      setTags(tags.filter(tag => !(tag.mainCategory === mainCategory && tag.subCategory === subCategory)));
    } else {
      setCategories(categories.filter(cat => cat.main !== mainCategory));
      setTags(tags.filter(tag => tag.mainCategory !== mainCategory));
    }
    if (selectedMainCategory === mainCategory) {
      setSelectedMainCategory('all');
      setSelectedSubCategory('all');
    } else if (selectedSubCategory === subCategory) {
      setSelectedSubCategory('all');
    }
  };

  const handleUpdateCategory = (oldName: string, newName: string, isMainCategory: boolean) => {
    if (isMainCategory) {
      setCategories(categories.map(cat =>
        cat.main === oldName ? { ...cat, main: newName } : cat
      ));
      setTags(tags.map(tag =>
        tag.mainCategory === oldName ? { ...tag, mainCategory: newName } : tag
      ));
      if (selectedMainCategory === oldName) {
        setSelectedMainCategory(newName);
      }
    } else {
      setCategories(categories.map(cat =>
        cat.main === selectedMainCategory
          ? { ...cat, sub: cat.sub.map(sub => sub === oldName ? newName : sub) }
          : cat
      ));
      setTags(tags.map(tag =>
        tag.mainCategory === selectedMainCategory && tag.subCategory === oldName
          ? { ...tag, subCategory: newName }
          : tag
      ));
      if (selectedSubCategory === oldName) {
        setSelectedSubCategory(newName);
      }
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(prevTags => [...prevTags, tag]);
      // Reset the weight when adding a new tag
      setTagWeights(prev => ({ ...prev, [tag.id]: 0 }));
    }
  };

  const handleReorderTags = (newOrder: Tag[]) => {
    console.log('Tags reordered:', newOrder);
    setSelectedTags(newOrder);
  };

  const filteredTags = tags.filter(tag => 
    (selectedMainCategory === 'all' || tag.mainCategory === selectedMainCategory) &&
    (selectedSubCategory === 'all' || tag.subCategory === selectedSubCategory)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI标签库</h1>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">已选标签</h2><TagDisplay
            selectedTags={selectedTags}
            onRemove={(tag) => {
              setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
              setTagWeights(prev => {
                const { [tag.id]: removed, ...rest } = prev;
                return rest;
              });
            }}
            manualInput={manualInput}
            onManualInputChange={handleManualInputChange}
            onManualInputKeyDown={handleManualInputKeyDown}
            onCopyTags={handleCopyTags}
            weightedMode={weightedMode}
            setWeightedMode={setWeightedMode}
            tagWeights={tagWeights}
            setTagWeights={setTagWeights}
            matchedTags={matchedTags}
            onSelectMatchedTag={handleSelectMatchedTag}
            onReorderTags={handleReorderTags}
          />
        </div>

        <div className="flex space-x-8">
          <div className="w-1/4">
            <CategoryView
              categories={categories}
              selectedMainCategory={selectedMainCategory}
              selectedSubCategory={selectedSubCategory}
              onSelectMainCategory={handleSelectMainCategory}
              onSelectSubCategory={handleSelectSubCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          </div>
          
          <div className="w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">标签列表</h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                >
                  <Plus className="mr-2" />
                  添加新标签
                </button>
              </div>
              <TagList
                tags={filteredTags}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={handleTagSelect}
              />
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <TagForm
                onSubmit={handleSubmit}
                categories={categories}
                initialData={editingTag || undefined}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTag(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;