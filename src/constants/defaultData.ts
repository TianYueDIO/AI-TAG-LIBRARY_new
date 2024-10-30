import { Tag, Category } from '../types';

export const defaultCategories: Category[] = [
  { main: '技术', sub: ['计算机科学', '人工智能', '网络安全', '数据科学', '软件工程'] },
  { main: '艺术', sub: ['绘画', '音乐', '雕塑', '摄影', '设计'] },
  { main: '科学', sub: ['物理', '化学', '生物', '天文', '地质'] },
  { main: '文学', sub: ['小说', '诗歌', '散文', '戏剧', '评论'] },
];

export const defaultTags: Tag[] = [
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