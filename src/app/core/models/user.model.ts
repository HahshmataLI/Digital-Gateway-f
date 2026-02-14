export enum UserRole {
  ADMIN = 'admin',
  COUNSELOR = 'counselor',
  TRAINER = 'trainer',
  ACCOUNTANT = 'accountant'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
}