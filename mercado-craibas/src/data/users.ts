import { User } from '../models/User';
import { Order } from '../types';
import { PRODUCTS } from './products';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'João Silva',
    email: 'joao@email.com',
    senha: '123456',
    role: 'customer',
    phone: '(82) 99999-1234',
    bio: 'Morador de Craibas, amante de tecnologia e gadgets.',
    joinDate: '15/01/2024',
    preferences: { notifications: true, newsletter: true, darkMode: false, language: 'pt-BR' },
    address: {
      street: 'Rua das Flores', number: '123', complement: 'Casa',
      neighborhood: 'Centro', city: 'Craibas', state: 'AL', zipCode: '57465-000',
    },
  },
  {
    id: 'u2',
    name: 'Admin Master',
    email: 'admin@mercadocraibas.com',
    senha: '123456',
    role: 'admin',
    phone: '(82) 99111-0000',
    bio: 'Gerenciando o Mercado Craibas desde 2022.',
    joinDate: '01/01/2022',
    preferences: { notifications: true, newsletter: false, darkMode: false, language: 'pt-BR' },
    address: {
      street: 'Av Principal', number: '1', neighborhood: 'Centro',
      city: 'Craibas', state: 'AL', zipCode: '57465-000',
    },
  },
  {
    id: 'u3',
    name: 'Carlos Entregador',
    email: 'entregador@mercadocraibas.com',
    senha: '123456',
    role: 'delivery',
    phone: '(82) 99888-7777',
    bio: 'Entregador parceiro desde 2022. Craibas e região.',
    vehicle: 'Honda CG 125 Fan — Vermelha',
    region: 'Craibas e Municípios Vizinhos',
    joinDate: '03/06/2022',
    preferences: { notifications: true, newsletter: false, darkMode: false, language: 'pt-BR' },
    address: {
      street: 'Rua dos Entregadores', number: '45', complement: '',
      neighborhood: 'Vila Nova', city: 'Craibas', state: 'AL', zipCode: '57465-100',
    },
  },
];

const today = new Date();
const yday = new Date(today); yday.setDate(today.getDate() - 1);
const twoDays = new Date(today); twoDays.setDate(today.getDate() - 2);
const threeDays = new Date(today); threeDays.setDate(today.getDate() - 3);
const fourDays = new Date(today); fourDays.setDate(today.getDate() - 4);
const fiveDays = new Date(today); fiveDays.setDate(today.getDate() - 5);
const sevenDays = new Date(today); sevenDays.setDate(today.getDate() - 7);


export const MOCK_ORDERS: Order[] = [

  {
    id: 'ORD-011',
    userId: 'u1',
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[7], quantity: 2 }],
    total: 9399.97,
    status: 'entregue',
    createdAt: sevenDays,
    updatedAt: fiveDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234567BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 470.00,
    date: new Date(2026, 5, 4)

  },
  {
    id: 'ORD-001',
    userId: 'u1',
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[7], quantity: 2 }],
    total: 9399.97,
    status: 'entregue',
    createdAt: sevenDays,
    updatedAt: fiveDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234567BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 470.00,
    date: new Date(2026, 5, 5)

  },
  {
    id: 'ORD-002',
    userId: 'u1',
    items: [{ product: PRODUCTS[2], quantity: 1, selectedVariation: { id: 'v1', name: 'Cor', value: 'Rose Quartz', type: 'color', stock: 40 } }],
    total: 349.99,
    status: 'saiu_entrega',
    createdAt: twoDays,
    updatedAt: yday,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    trackingCode: 'MC001234568BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 17.50,
    date: new Date(2026, 5, 6)
  },
  {
    id: 'ORD-003',
    userId: 'u1',
    items: [{ product: PRODUCTS[4], quantity: 1 }],
    total: 1799.99,
    status: 'preparando',
    createdAt: today,
    updatedAt: today,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 1234',
    deliveryPersonId: 'u3',
    deliveryCommission: 90.00,
    date: new Date(2026, 5, 7)
  },
  {
    id: 'ORD-004',
    userId: 'u1',
    items: [{ product: PRODUCTS[8], quantity: 3 }, { product: PRODUCTS[10], quantity: 1 }],
    total: 229.96,
    status: 'confirmado',
    createdAt: today,
    updatedAt: today,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    deliveryCommission: 11.50,
    date: new Date(2026, 5, 8)

  },
  {
    id: 'ORD-005',
    userId: 'u1',
    items: [{ product: PRODUCTS[5], quantity: 1 }],
    total: 12499.99,
    status: 'entregue',
    createdAt: fourDays,
    updatedAt: twoDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234570BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 625.00,
    date: new Date(2026, 5, 9)
  },
  {
    id: 'ORD-006',
    userId: 'u1',
    items: [{ product: PRODUCTS[9], quantity: 1 }, { product: PRODUCTS[3], quantity: 1 }],
    total: 469.98,
    status: 'entregue',
    createdAt: threeDays,
    updatedAt: yday,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    trackingCode: 'MC001234571BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 23.50,
    date: new Date(2026, 5, 10)

  },
  {
    id: 'ORD-011',
    userId: 'u1',
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[7], quantity: 2 }],
    total: 9399.97,
    status: 'cancelado',
    createdAt: sevenDays,
    updatedAt: fiveDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234567BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 470.00,
    date: new Date(2026, 5, 4)

  },
  {
    id: 'ORD-011',
    userId: 'u1',
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[7], quantity: 2 }],
    total: 9399.97,
    status: 'cancelado',
    createdAt: sevenDays,
    updatedAt: fiveDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234567BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 470.00,
    date: new Date(2026, 5, 4)

  },
  {
    id: 'ORD-001',
    userId: 'u1',
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[7], quantity: 2 }],
    total: 9399.97,
    status: 'cancelado',
    createdAt: sevenDays,
    updatedAt: fiveDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234567BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 470.00,
    date: new Date(2026, 5, 5)

  },
  {
    id: 'ORD-002',
    userId: 'u1',
    items: [{ product: PRODUCTS[2], quantity: 1, selectedVariation: { id: 'v1', name: 'Cor', value: 'Rose Quartz', type: 'color', stock: 40 } }],
    total: 349.99,
    status: 'cancelado',
    createdAt: twoDays,
    updatedAt: yday,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    trackingCode: 'MC001234568BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 17.50,
    date: new Date(2026, 5, 5)
  },
  {
    id: 'ORD-003',
    userId: 'u1',
    items: [{ product: PRODUCTS[4], quantity: 1 }],
    total: 1799.99,
    status: 'cancelado',
    createdAt: today,
    updatedAt: today,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 1234',
    deliveryPersonId: 'u3',
    deliveryCommission: 90.00,
    date: new Date(2026, 5, 4)
  },
  {
    id: 'ORD-004',
    userId: 'u1',
    items: [{ product: PRODUCTS[8], quantity: 3 }, { product: PRODUCTS[10], quantity: 1 }],
    total: 229.96,
    status: 'cancelado',
    createdAt: today,
    updatedAt: today,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    deliveryCommission: 11.50,
    date: new Date(2026, 5, 5)

  },
  {
    id: 'ORD-005',
    userId: 'u1',
    items: [{ product: PRODUCTS[5], quantity: 1 }],
    total: 12499.99,
    status: 'cancelado',
    createdAt: fourDays,
    updatedAt: twoDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234570BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 625.00,
    date: new Date(2026, 5, 8)
  },
  {
    id: 'ORD-006',
    userId: 'u1',
    items: [{ product: PRODUCTS[9], quantity: 1 }, { product: PRODUCTS[3], quantity: 1 }],
    total: 469.98,
    status: 'cancelado',
    createdAt: threeDays,
    updatedAt: yday,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    trackingCode: 'MC001234571BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 23.50,
    date: new Date(2026, 5, 7)

  },
  {
    id: 'ORD-001',
    userId: 'u1',
    items: [{ product: PRODUCTS[0], quantity: 1 }, { product: PRODUCTS[7], quantity: 2 }],
    total: 9399.97,
    status: 'cancelado',
    createdAt: sevenDays,
    updatedAt: fiveDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234567BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 470.00,
    date: new Date(2026, 5, 8)

  },
  {
    id: 'ORD-002',
    userId: 'u1',
    items: [{ product: PRODUCTS[2], quantity: 1, selectedVariation: { id: 'v1', name: 'Cor', value: 'Rose Quartz', type: 'color', stock: 40 } }],
    total: 349.99,
    status: 'cancelado',
    createdAt: twoDays,
    updatedAt: yday,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    trackingCode: 'MC001234568BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 17.50,
    date: new Date(2026, 5, 8)
  },
  {
    id: 'ORD-003',
    userId: 'u1',
    items: [{ product: PRODUCTS[4], quantity: 1 }],
    total: 1799.99,
    status: 'cancelado',
    createdAt: today,
    updatedAt: today,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 1234',
    deliveryPersonId: 'u3',
    deliveryCommission: 90.00,
    date: new Date(2026, 5, 9)
  },
  {
    id: 'ORD-004',
    userId: 'u1',
    items: [{ product: PRODUCTS[8], quantity: 3 }, { product: PRODUCTS[10], quantity: 1 }],
    total: 229.96,
    status: 'cancelado',
    createdAt: today,
    updatedAt: today,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    deliveryCommission: 11.50,
    date: new Date(2026, 5, 9)

  },
  {
    id: 'ORD-005',
    userId: 'u1',
    items: [{ product: PRODUCTS[5], quantity: 1 }],
    total: 12499.99,
    status: 'cancelado',
    createdAt: fourDays,
    updatedAt: twoDays,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'Cartão de Crédito •••• 4242',
    trackingCode: 'MC001234570BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 625.00,
    date: new Date(2026, 5, 9)
  },
  {
    id: 'ORD-006',
    userId: 'u1',
    items: [{ product: PRODUCTS[9], quantity: 1 }, { product: PRODUCTS[3], quantity: 1 }],
    total: 469.98,
    status: 'cancelado',
    createdAt: threeDays,
    updatedAt: yday,
    address: MOCK_USERS[0].address!,
    paymentMethod: 'PIX',
    trackingCode: 'MC001234571BR',
    deliveryPersonId: 'u3',
    deliveryCommission: 23.50,
    date: new Date(2026, 5, 10)

  },
];
