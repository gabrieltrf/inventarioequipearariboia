
import { Item, ItemCategory, ItemStatus, Loan, Movement, MovementReason, MovementType, User, UserRole } from '@/types';

// Categorias
export const categories: ItemCategory[] = [
  { id: '1', name: 'Elétrica' },
  { id: '2', name: 'Mecânica' },
  { id: '3', name: 'Ferramentas' },
  { id: '4', name: 'EPIs' },
  { id: '5', name: 'Eletrônica' },
];

// Usuários
export const users: User[] = [
  { id: '1', name: 'Admin', email: 'admin@equipe.com', role: UserRole.ADMIN },
  { id: '2', name: 'João Silva', email: 'joao@equipe.com', role: UserRole.MEMBER },
  { id: '3', name: 'Maria Souza', email: 'maria@equipe.com', role: UserRole.MEMBER },
  { id: '4', name: 'Pedro Oliveira', email: 'pedro@equipe.com', role: UserRole.MEMBER },
];

// Itens
export const items: Item[] = [
  {
    id: '001',
    name: 'Chave de Fenda Phillips',
    description: 'Chave de fenda com ponta phillips, tamanho médio',
    category: categories[2],
    quantity: 5,
    minQuantity: 2,
    unit: 'unidade',
    location: 'Caixa de ferramentas A',
    status: ItemStatus.AVAILABLE,
    createdAt: new Date(2023, 5, 10),
    updatedAt: new Date(2023, 5, 10),
  },
  {
    id: '002',
    name: 'Multímetro Digital',
    description: 'Multímetro digital para medições elétricas',
    category: categories[0],
    quantity: 2,
    minQuantity: 1,
    unit: 'unidade',
    location: 'Armário Elétrica',
    status: ItemStatus.BORROWED,
    createdAt: new Date(2023, 6, 15),
    updatedAt: new Date(2023, 7, 20),
  },
  {
    id: '003',
    name: 'Capacete de Segurança',
    description: 'Capacete de segurança branco',
    category: categories[3],
    quantity: 8,
    minQuantity: 3,
    unit: 'unidade',
    location: 'Armário EPIs',
    status: ItemStatus.AVAILABLE,
    createdAt: new Date(2023, 4, 5),
    updatedAt: new Date(2023, 4, 5),
  },
  {
    id: '004',
    name: 'Motor Elétrico 12V',
    description: 'Motor DC 12V alta potência',
    category: categories[0],
    quantity: 1,
    minQuantity: 1,
    unit: 'unidade',
    location: 'Prateleira Componentes',
    status: ItemStatus.DAMAGED,
    createdAt: new Date(2023, 3, 20),
    updatedAt: new Date(2023, 8, 10),
  },
  {
    id: '005',
    name: 'Placa Arduino Uno',
    description: 'Placa Arduino Uno R3 com cabo USB',
    category: categories[4],
    quantity: 3,
    minQuantity: 2,
    unit: 'unidade',
    location: 'Gaveta Eletrônica',
    status: ItemStatus.MAINTENANCE,
    createdAt: new Date(2023, 7, 12),
    updatedAt: new Date(2023, 9, 5),
  },
  {
    id: '006',
    name: 'Luvas de Proteção',
    description: 'Luvas de proteção para trabalhos mecânicos',
    category: categories[3],
    quantity: 10,
    minQuantity: 5,
    unit: 'par',
    location: 'Armário EPIs',
    status: ItemStatus.AVAILABLE,
    createdAt: new Date(2023, 2, 8),
    updatedAt: new Date(2023, 2, 8),
  },
  {
    id: '007',
    name: 'Rolamento 608ZZ',
    description: 'Rolamento de esferas 608ZZ',
    category: categories[1],
    quantity: 20,
    minQuantity: 5,
    unit: 'unidade',
    location: 'Gaveta Rolamentos',
    status: ItemStatus.AVAILABLE,
    createdAt: new Date(2023, 1, 15),
    updatedAt: new Date(2023, 1, 15),
  },
  {
    id: '008',
    name: 'Chave Allen 3mm',
    description: 'Chave allen hexagonal 3mm',
    category: categories[2],
    quantity: 2,
    minQuantity: 2,
    unit: 'unidade',
    location: 'Caixa de ferramentas B',
    status: ItemStatus.BORROWED,
    createdAt: new Date(2023, 8, 25),
    updatedAt: new Date(2023, 9, 10),
  },
];

// Movimentações
export const movements: Movement[] = [
  {
    id: '1',
    item: items[0],
    type: MovementType.INPUT,
    reason: MovementReason.PURCHASE,
    quantity: 5,
    responsibleUser: users[0],
    date: new Date(2023, 5, 10),
    notes: 'Compra inicial',
  },
  {
    id: '2',
    item: items[1],
    type: MovementType.INPUT,
    reason: MovementReason.PURCHASE,
    quantity: 2,
    responsibleUser: users[0],
    date: new Date(2023, 6, 15),
    notes: 'Compra para laboratório',
  },
  {
    id: '3',
    item: items[1],
    type: MovementType.OUTPUT,
    reason: MovementReason.USE,
    quantity: 1,
    responsibleUser: users[2],
    date: new Date(2023, 7, 20),
    notes: 'Uso em testes',
  },
  {
    id: '4',
    item: items[3],
    type: MovementType.OUTPUT,
    reason: MovementReason.MAINTENANCE,
    quantity: 1,
    responsibleUser: users[1],
    date: new Date(2023, 8, 10),
    notes: 'Enviado para reparo',
  },
];

// Empréstimos
export const loans: Loan[] = [
  {
    id: '1',
    item: items[1],
    borrower: users[2],
    quantity: 1,
    borrowDate: new Date(2023, 7, 20),
    expectedReturnDate: new Date(2023, 7, 25),
    notes: 'Para testes no laboratório',
  },
  {
    id: '2',
    item: items[7],
    borrower: users[3],
    quantity: 2,
    borrowDate: new Date(2023, 9, 10),
    expectedReturnDate: new Date(2023, 9, 17),
    notes: 'Para montagem do protótipo',
  }
];

// Estado atual do usuário logado (para simular autenticação)
export let currentUser: User = users[0]; // Admin por padrão

// Função para mudar o usuário atual
export function setCurrentUser(userId: string) {
  const user = users.find(u => u.id === userId);
  if (user) {
    currentUser = user;
    return true;
  }
  return false;
}

// Funções auxiliares
export function getItemsWithLowStock() {
  return items.filter(item => item.quantity < 3);
}

export function getDamagedItems() {
  return items.filter(item => item.status === ItemStatus.DAMAGED);
}

export function getOverdueLoans() {
  const today = new Date();
  return loans.filter(loan => 
    !loan.actualReturnDate && 
    loan.expectedReturnDate < today
  );
}
