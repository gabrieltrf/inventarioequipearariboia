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

export interface Location {
  id: string;
  name: string;
  description: string;
  capacity?: number;
  responsible?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemDocument {
  id: string;
  name: string;
  url: string;
  type: string; // 'image', 'pdf', 'document'
  size?: number; // in bytes
  uploadDate?: Date;
  fileName?: string;
  fileUrl?: string;
  downloadUrl?: string;
  path?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  quantity: number;
  minQuantity: number;
  unit: string;
  locationId: string; // Modificado para usar o ID da localização em vez de uma string
  status: ItemStatus;
  imageUrl?: string;
  documents?: ItemDocument[];
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
