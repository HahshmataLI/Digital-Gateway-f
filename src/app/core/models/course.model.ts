export interface CurriculumTopic {
  topic: string;
  hours: number;
}

export interface UserRef {
  _id: string;
  name: string;
  email?: string;
}

export interface Course {
  _id?: string;
  name: string;
  code: string;
  description: string;
  duration: '1 month' | '2 months' | '3 months' | '6 months' | '1 year';
  fees: number;
  curriculum: CurriculumTopic[];
  prerequisites: string[];
  isActive: boolean;
  createdBy?: string | UserRef; // Can be ObjectId string or populated user
  updatedBy?: string | UserRef; // Can be ObjectId string or populated user
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseFilter {
  search?: string;
  isActive?: boolean;
  duration?: string;
}