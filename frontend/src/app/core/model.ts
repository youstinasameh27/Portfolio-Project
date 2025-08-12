export interface IProject{
  _id?: string;
  title: string;
  description: string;
  tech: string[];
  imageUrl?: string;
  link?: string;
  grade?: number;
  createdAt?: string;
}
export interface ISkill{
  _id?: string;
  name: string;
  level: 'beginner'|'intermediate'|'advanced';
  iconUrl?: string;
}
export interface ITopic{
  _id?: string;
  section: 'introduction'|'backend'|'frontend';
  name: string;
  grade: number;
}
