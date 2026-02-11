/**
 * Dados mock reutilizaveis para paginas de exemplo.
 * Usados como fonte de dados para demonstrar componentes e utilitarios.
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock";
}

export interface MockStat {
  key: string;
  value: number;
  previousValue: number;
  trend: "up" | "down" | "neutral";
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "Ana Silva",
    email: "ana.silva@example.com",
    cpf: "12345678901",
    role: "admin",
    status: "active",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Carlos Santos",
    email: "carlos.santos@example.com",
    cpf: "98765432100",
    role: "editor",
    status: "active",
    createdAt: "2025-02-20T14:15:00Z",
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    cpf: "45678912300",
    role: "viewer",
    status: "inactive",
    createdAt: "2025-03-10T09:00:00Z",
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro.costa@example.com",
    cpf: "32165498700",
    role: "editor",
    status: "active",
    createdAt: "2025-04-05T16:45:00Z",
  },
  {
    id: "5",
    name: "Julia Ferreira",
    email: "julia.ferreira@example.com",
    cpf: "65432198700",
    role: "viewer",
    status: "pending",
    createdAt: "2025-05-12T11:20:00Z",
  },
  {
    id: "6",
    name: "Rafael Souza",
    email: "rafael.souza@example.com",
    cpf: "78912345600",
    role: "admin",
    status: "active",
    createdAt: "2025-06-18T08:30:00Z",
  },
  {
    id: "7",
    name: "Beatriz Lima",
    email: "beatriz.lima@example.com",
    cpf: "14725836900",
    role: "editor",
    status: "active",
    createdAt: "2025-07-22T13:10:00Z",
  },
  {
    id: "8",
    name: "Lucas Pereira",
    email: "lucas.pereira@example.com",
    cpf: "25836914700",
    role: "viewer",
    status: "inactive",
    createdAt: "2025-08-30T15:55:00Z",
  },
  {
    id: "9",
    name: "Camila Rodrigues",
    email: "camila.rodrigues@example.com",
    cpf: "36925814700",
    role: "editor",
    status: "active",
    createdAt: "2025-09-14T10:00:00Z",
  },
  {
    id: "10",
    name: "Thiago Almeida",
    email: "thiago.almeida@example.com",
    cpf: "85274136900",
    role: "viewer",
    status: "pending",
    createdAt: "2025-10-01T17:30:00Z",
  },
  {
    id: "11",
    name: "Fernanda Barbosa",
    email: "fernanda.barbosa@example.com",
    cpf: "95175385200",
    role: "admin",
    status: "active",
    createdAt: "2025-10-10T09:15:00Z",
  },
  {
    id: "12",
    name: "Gabriel Martins",
    email: "gabriel.martins@example.com",
    cpf: "75315928600",
    role: "editor",
    status: "active",
    createdAt: "2025-10-20T12:00:00Z",
  },
  {
    id: "13",
    name: "Isabela Nunes",
    email: "isabela.nunes@example.com",
    cpf: "15935748200",
    role: "viewer",
    status: "inactive",
    createdAt: "2025-11-05T14:30:00Z",
  },
  {
    id: "14",
    name: "Matheus Ribeiro",
    email: "matheus.ribeiro@example.com",
    cpf: "35795148200",
    role: "editor",
    status: "pending",
    createdAt: "2025-11-15T11:45:00Z",
  },
  {
    id: "15",
    name: "Larissa Carvalho",
    email: "larissa.carvalho@example.com",
    cpf: "46813579200",
    role: "viewer",
    status: "active",
    createdAt: "2025-12-01T16:00:00Z",
  },
  {
    id: "16",
    name: "Henrique Gomes",
    email: "henrique.gomes@example.com",
    cpf: "57924681300",
    role: "admin",
    status: "active",
    createdAt: "2025-12-10T08:00:00Z",
  },
  {
    id: "17",
    name: "Patricia Dias",
    email: "patricia.dias@example.com",
    cpf: "68135792400",
    role: "editor",
    status: "active",
    createdAt: "2025-12-20T13:30:00Z",
  },
  {
    id: "18",
    name: "Bruno Araújo",
    email: "bruno.araujo@example.com",
    cpf: "79246813500",
    role: "viewer",
    status: "inactive",
    createdAt: "2026-01-05T10:15:00Z",
  },
  {
    id: "19",
    name: "Amanda Teixeira",
    email: "amanda.teixeira@example.com",
    cpf: "81357924600",
    role: "editor",
    status: "active",
    createdAt: "2026-01-15T15:00:00Z",
  },
  {
    id: "20",
    name: "Diego Monteiro",
    email: "diego.monteiro@example.com",
    cpf: "92468135700",
    role: "viewer",
    status: "pending",
    createdAt: "2026-01-25T09:45:00Z",
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "p1",
    name: "Notebook Pro 15",
    price: 7999.9,
    category: "electronics",
    stock: 45,
    status: "available",
  },
  {
    id: "p2",
    name: "Mouse Wireless",
    price: 149.9,
    category: "peripherals",
    stock: 230,
    status: "available",
  },
  {
    id: "p3",
    name: "Teclado Mecânico RGB",
    price: 499.9,
    category: "peripherals",
    stock: 8,
    status: "low_stock",
  },
  {
    id: "p4",
    name: 'Monitor 27" 4K',
    price: 3299.9,
    category: "electronics",
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: "p5",
    name: "Webcam HD 1080p",
    price: 299.9,
    category: "peripherals",
    stock: 67,
    status: "available",
  },
  {
    id: "p6",
    name: "Headset Gamer",
    price: 399.9,
    category: "peripherals",
    stock: 3,
    status: "low_stock",
  },
  {
    id: "p7",
    name: "SSD 1TB NVMe",
    price: 599.9,
    category: "storage",
    stock: 120,
    status: "available",
  },
  {
    id: "p8",
    name: "Hub USB-C 7 portas",
    price: 249.9,
    category: "peripherals",
    stock: 0,
    status: "out_of_stock",
  },
  {
    id: "p9",
    name: "Cadeira Ergonômica",
    price: 1899.9,
    category: "furniture",
    stock: 15,
    status: "available",
  },
  {
    id: "p10",
    name: "Suporte para Monitor",
    price: 189.9,
    category: "furniture",
    stock: 42,
    status: "available",
  },
];

export const MOCK_DASHBOARD_STATS: MockStat[] = [
  { key: "totalUsers", value: 2350, previousValue: 2090, trend: "up" },
  { key: "totalPosts", value: 1203, previousValue: 1112, trend: "up" },
  { key: "activeNow", value: 573, previousValue: 556, trend: "up" },
  { key: "revenue", value: 45231, previousValue: 37690, trend: "up" },
];
