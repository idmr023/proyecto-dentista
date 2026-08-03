import { z } from 'zod';

export const roleEnum = z.enum(['admin', 'colaborador', 'cliente']);
export type Role = z.infer<typeof roleEnum>;

// ─── Auth ────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerClientSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]+$/, 'El nombre solo puede contener letras (sin números)'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]+$/, 'El nombre solo puede contener letras (sin números)'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string(),
  role: roleEnum.default('cliente'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// ─── Patients ────────────────────────────────────────
export const patientSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s]+$/, 'El nombre solo puede contener letras (sin números)'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
  email: z.string().email('Ingresa un correo válido').optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

// ─── Appointments ────────────────────────────────────
export const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  service: z.string().min(1, 'Selecciona un servicio'),
  appointment_date: z.string().min(1, 'Selecciona una fecha'),
  appointment_time: z.string().min(1, 'Selecciona una hora'),
  notes: z.string().optional().or(z.literal('')),
});

// ─── Tooth Marks ─────────────────────────────────────
export const faceEnum = z.enum(['all', 'oclusal', 'vestibular', 'palatina', 'mesial', 'distal']);
export type Face = z.infer<typeof faceEnum>;

export const toothMarkSchema = z.object({
  tooth_id: z.number().int().min(11).max(48),
  tool: z.string().min(1),
  face: faceEnum.default('all'),
});

export const bulkOdontogramSchema = z.object({
  marks: z.array(toothMarkSchema),
});

// ─── Products ────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().or(z.literal('')),
  price: z.number().positive('El precio debe ser positivo'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
});

// ─── Orders ──────────────────────────────────────────
export const orderItemSchema = z.object({
  product_id: z.string().min(1),
  qty: z.number().int().positive('La cantidad debe ser al menos 1'),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Agrega al menos un producto'),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada']),
});
