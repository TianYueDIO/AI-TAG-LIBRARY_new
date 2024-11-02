import React, { useState } from 'react';
import Fuse from 'fuse.js';
import { Tag, TagFormData } from './types';
import TagForm from './components/TagForm';
import TagList from './components/TagList';
import CategoryView from './components/CategoryView';
import TagDisplay from './components/TagDisplay';
import { Plus } from 'lucide-react';
import { useTagLibrary } from './hooks/useTagLibrary';
import { defaultTags, defaultCategories } from './constants/defaultData';

const App: React.FC = () => {
  const {
    tags,
    categories,
    selectedTags,
    tagWeights,
    isLoading,
    saveTag,
    updateTag,
    deleteTag,
    updateCategories,
    updateSelectedTags,
    updateTagWeights,
  } = useTagLibrary(defaultTags, defaultCategories);

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [weightedMode, setWeightedMode] = useState(false);
  const [matchedTags, setMatchedTags] = useState<Tag[]>([]);

  const handleAddCategory = (mainCategory: string, subCategory?: string) => {
    const updatedCategories = [...categories];
    const existingMainCategoryIndex = updatedCategories.findIndex(cat => cat.main === mainCategory);

    if (existingMainCategoryIndex === -1) {
      updatedCategories.push({ main: mainCategory, sub: subCategory ? [subCategory] : [] });
    } else if (subCategory) {
      if (!updatedCategories[existingMainCategoryIndex].sub.includes(subCategory)) {
        updatedCategories[existingMainCategoryIndex].sub.push(subCategory);
      }
    }

    updateCategories(updatedCategories);
  };

  const handleSubmit = async (data: TagFormData) => {
    if (editingTag) {
      await updateTag({ ...editingTag, ...data });
    } else {
      await saveTag({ ...data, id: Date.now().toString() });
    }
    
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
      updateSelectedTags([...selectedTags, tag]);
      updateTagWeights({ ...tagWeights, [tag.id]: 0 });
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
      updateSelectedTags([...selectedTags, newTag]);
      updateTagWeights({ ...tagWeights, [newTag.id]: 0 });
      setManualInput('');
      setMatchedTags([]);
    }
  };

  const handleCopyTags = () => {
    const tagString = selectedTags.map(tag => {
      const weight = tagWeights[tag.id] || 0;
      return '{'.repeat(weight) + tag.name + '}'.repeat(weight);
    }).join(', ');
    navigator.clipboard.writeText(tagString);
  };

  const handleSelectMainCategory = (category: string) => {
    setSelectedMainCategory(category);
    setSelectedSubCategory('all');
  };

  const handleSelectSubCategory = (category: string) => {
    setSelectedSubCategory(category);
  };

  const handleDeleteCategory = (mainCategory: string, subCategory?: string) => {
    const updatedCategories = [...categories];
    if (subCategory) {
      const mainCategoryIndex = updatedCategories.findIndex(cat => cat.main === mainCategory);
      if (mainCategoryIndex !== -1) {
        updatedCategories[mainCategoryIndex].sub = updatedCategories[mainCategoryIndex].sub
          .filter(sub => sub !== subCategory);
        updateCategories(updatedCategories);
      }
    } else {
      updateCategories(updatedCategories.filter(cat => cat.main !== mainCategory));
    }

    if (selectedMainCategory === mainCategory) {
      setSelectedMainCategory('all');
      setSelectedSubCategory('all');
    } else if (selectedSubCategory === subCategory) {
      setSelectedSubCategory('all');
    }
  };

  const handleUpdateCategory = (oldName: string, newName: string, isMainCategory: boolean) => {
    const updatedCategories = [...categories];
    if (isMainCategory) {
      const index = updatedCategories.findIndex(cat => cat.main === oldName);
      if (index !== -1) {
        updatedCategories[index].main = newName;
      }
    } else {
      const mainCategoryIndex = updatedCategories.findIndex(cat => cat.main === selectedMainCategory);
      if (mainCategoryIndex !== -1) {
        updatedCategories[mainCategoryIndex].sub = updatedCategories[mainCategoryIndex].sub
          .map(sub => sub === oldName ? newName : sub);
      }
    }
    updateCategories(updatedCategories);

    if (isMainCategory && selectedMainCategory === oldName) {
      setSelectedMainCategory(newName);
    } else if (!isMainCategory && selectedSubCategory === oldName) {
      setSelectedSubCategory(newName);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleClearAllTags = () => {
    updateSelectedTags([]);
    updateTagWeights({});
  };

  const filteredTags = tags.filter(tag => 
    (selectedMainCategory === 'all' || tag.mainCategory === selectedMainCategory) &&
    (selectedSubCategory === 'all' || tag.subCategory === selectedSubCategory)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI标签库</h1>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">已选标签</h2>
          <TagDisplay
            selectedTags={selectedTags}
            onRemove={(tag) => {
              updateSelectedTags(selectedTags.filter(t => t.id !== tag.id));
              const newWeights = { ...tagWeights };
              delete newWeights[tag.id];
              updateTagWeights(newWeights);
            }}
            manualInput={manualInput}
            onManualInputChange={handleManualInputChange}
            onManualInputKeyDown={handleManualInputKeyDown}
            onCopyTags={handleCopyTags}
            weightedMode={weightedMode}
            setWeightedMode={setWeightedMode}
            tagWeights={tagWeights}
            setTagWeights={updateTagWeights}
            matchedTags={matchedTags}
            onSelectMatchedTag={handleSelectMatchedTag}
            onReorderTags={updateSelectedTags}
            onClearAllTags={handleClearAllTags}
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
                onDelete={deleteTag}
                onSelect={(tag) => {
                  if (!selectedTags.some(t => t.id === tag.id)) {
                    updateSelectedTags([...selectedTags, tag]);
                    updateTagWeights({ ...tagWeights, [tag.id]: 0 });
                  }
                }}
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