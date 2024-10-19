export interface Tag {
  id: string;
  name: string;
  translation: string;
  mainCategory: string;
  subCategory: string;
  imageUrl?: string;
}

export interface TagFormData {
  name: string;
  translation: string;
  mainCategory: string;
  subCategory: string;
  imageUrl?: string;
}

export interface Category {
  main: string;
  sub: string[];
}