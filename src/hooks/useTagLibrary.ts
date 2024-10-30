import { useState, useEffect, useCallback } from 'react';
import { Tag, Category } from '../types';
import { tagLibraryDB } from '../services/db';

export function useTagLibrary(defaultTags: Tag[], defaultCategories: Category[]) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagWeights, setTagWeights] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        await tagLibraryDB.initializeDefaultData(defaultTags, defaultCategories);
        const [loadedTags, loadedCategories, loadedSelectedTags, loadedWeights] = await Promise.all([
          tagLibraryDB.getAllTags(),
          tagLibraryDB.getAllCategories(),
          tagLibraryDB.getSelectedTags(),
          tagLibraryDB.getTagWeights(),
        ]);

        setTags(loadedTags);
        setCategories(loadedCategories);
        setSelectedTags(loadedSelectedTags);
        setTagWeights(loadedWeights);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [defaultTags, defaultCategories]);

  // 保存标签
  const saveTag = useCallback(async (tag: Tag) => {
    try {
      await tagLibraryDB.addTag(tag);
      setTags(prev => [...prev, tag]);
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  }, []);

  // 更新标签
  const updateTag = useCallback(async (tag: Tag) => {
    try {
      await tagLibraryDB.updateTag(tag);
      setTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  }, []);

  // 删除标签
  const deleteTag = useCallback(async (id: string) => {
    try {
      await tagLibraryDB.deleteTag(id);
      setTags(prev => prev.filter(tag => tag.id !== id));
      setSelectedTags(prev => prev.filter(tag => tag.id !== id));
      setTagWeights(prev => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  }, []);

  // 更新分类
  const updateCategories = useCallback(async (newCategories: Category[]) => {
    try {
      await tagLibraryDB.updateCategories(newCategories);
      setCategories(newCategories);
    } catch (error) {
      console.error('Failed to update categories:', error);
    }
  }, []);

  // 更新已选标签
  const updateSelectedTags = useCallback(async (newSelectedTags: Tag[]) => {
    try {
      await tagLibraryDB.updateSelectedTags(newSelectedTags);
      setSelectedTags(newSelectedTags);
    } catch (error) {
      console.error('Failed to update selected tags:', error);
    }
  }, []);

  // 更新标签权重
  const updateTagWeights = useCallback(async (newWeights: Record<string, number>) => {
    try {
      await tagLibraryDB.updateTagWeights(newWeights);
      setTagWeights(newWeights);
    } catch (error) {
      console.error('Failed to update tag weights:', error);
    }
  }, []);

  return {
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
  };
}