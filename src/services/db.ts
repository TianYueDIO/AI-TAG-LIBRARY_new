import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Tag, Category } from '../types';

interface TagLibraryDB extends DBSchema {
  tags: {
    key: string;
    value: Tag;
    indexes: {
      'by-category': [string, string]; // [mainCategory, subCategory]
      'by-name': string;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
  selectedTags: {
    key: string;
    value: Tag;
  };
  tagWeights: {
    key: string;
    value: number;
  };
}

const DB_NAME = 'ai-tag-library';
const DB_VERSION = 1;

class TagLibraryService {
  private db: IDBPDatabase<TagLibraryDB> | null = null;

  async init() {
    if (this.db) return;

    this.db = await openDB<TagLibraryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tags store
        const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
        tagStore.createIndex('by-category', ['mainCategory', 'subCategory']);
        tagStore.createIndex('by-name', 'name');

        // Categories store
        db.createObjectStore('categories', { keyPath: 'main' });

        // Selected tags store
        db.createObjectStore('selectedTags', { keyPath: 'id' });

        // Tag weights store
        db.createObjectStore('tagWeights', { keyPath: 'id' });
      },
    });
  }

  // Tags CRUD
  async getAllTags(): Promise<Tag[]> {
    await this.init();
    return this.db!.getAll('tags');
  }

  async addTag(tag: Tag): Promise<void> {
    await this.init();
    await this.db!.put('tags', tag);
  }

  async updateTag(tag: Tag): Promise<void> {
    await this.init();
    await this.db!.put('tags', tag);
  }

  async deleteTag(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('tags', id);
    // Clean up related data
    await this.db!.delete('selectedTags', id);
    await this.db!.delete('tagWeights', id);
  }

  async getTagsByCategory(mainCategory: string, subCategory?: string): Promise<Tag[]> {
    await this.init();
    const index = this.db!.transaction('tags').store.index('by-category');
    if (subCategory) {
      return index.getAll([mainCategory, subCategory]);
    }
    return index.getAll(IDBKeyRange.bound(
      [mainCategory, ''],
      [mainCategory, '\uffff']
    ));
  }

  async searchTags(query: string): Promise<Tag[]> {
    await this.init();
    const index = this.db!.transaction('tags').store.index('by-name');
    const allTags = await this.getAllTags();
    return allTags.filter(tag => 
      tag.name.toLowerCase().includes(query.toLowerCase()) ||
      tag.translation.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Categories CRUD
  async getAllCategories(): Promise<Category[]> {
    await this.init();
    return this.db!.getAll('categories');
  }

  async updateCategories(categories: Category[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('categories', 'readwrite');
    await Promise.all([
      ...categories.map(category => tx.store.put(category)),
      tx.done,
    ]);
  }

  // Selected Tags
  async getSelectedTags(): Promise<Tag[]> {
    await this.init();
    return this.db!.getAll('selectedTags');
  }

  async updateSelectedTags(tags: Tag[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('selectedTags', 'readwrite');
    await tx.store.clear();
    await Promise.all([
      ...tags.map(tag => tx.store.put(tag)),
      tx.done,
    ]);
  }

  // Tag Weights
  async getTagWeights(): Promise<Record<string, number>> {
    await this.init();
    const weights = await this.db!.getAll('tagWeights');
    return weights.reduce((acc, { id, value }) => ({
      ...acc,
      [id]: value,
    }), {});
  }

  async updateTagWeights(weights: Record<string, number>): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('tagWeights', 'readwrite');
    await tx.store.clear();
    await Promise.all([
      ...Object.entries(weights).map(([id, value]) => 
        tx.store.put({ id, value })),
      tx.done,
    ]);
  }

  // Initialize with default data if empty
  async initializeDefaultData(defaultTags: Tag[], defaultCategories: Category[]): Promise<void> {
    await this.init();
    const existingTags = await this.getAllTags();
    const existingCategories = await this.getAllCategories();

    if (existingTags.length === 0) {
      const tx = this.db!.transaction('tags', 'readwrite');
      await Promise.all([
        ...defaultTags.map(tag => tx.store.put(tag)),
        tx.done,
      ]);
    }

    if (existingCategories.length === 0) {
      const tx = this.db!.transaction('categories', 'readwrite');
      await Promise.all([
        ...defaultCategories.map(category => tx.store.put(category)),
        tx.done,
      ]);
    }
  }
}

export const tagLibraryDB = new TagLibraryService();