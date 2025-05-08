
// Tipos para o sistema de inventário

export enum ItemStatus {
  AVAILABLE = "Disponível",
  BORROWED = "Emprestado",
  DAMAGED = "Danificado",
  MAINTENANCE = "Em manutenção"
}

export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member"
}

export enum MovementType {
  INPUT = "Entrada",
  OUTPUT = "Saída"
}

export enum MovementReason {
  PURCHASE = "Compra",
  USE = "Uso",
  DISCARD = "Descarte",
  MAINTENANCE = "Manutenção",
  OTHER = "Outro"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ItemCategory {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  status: ItemStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Movement {
  id: string;
  item: Item;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  responsibleUser: User;
  date: Date;
  notes?: string;
}

export interface Loan {
  id: string;
  item: Item;
  borrower: User;
  quantity: number;
  borrowDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  notes?: string;
}
