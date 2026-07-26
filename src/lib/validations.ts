import { z } from 'zod';

// ============================================================
// Zod Validation Schemas for all API routes
// ============================================================

export const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi.').max(100, 'Nama terlalu panjang.'),
  email: z.string().email('Format email tidak valid.').max(255),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.').max(128),
  category: z.string().min(1, 'Kategori wajib dipilih.'),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional().default({}),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi.').max(100),
  email: z.string().email('Format email tidak valid.').max(255),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.').max(128).optional(),
  role: z.enum(['admin', 'election_admin', 'voter']).optional().default('voter'),
  category: z.string().optional().default(''),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional().default({}),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  avatar: z.string().optional().default(''),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6).max(128).optional(),
  role: z.enum(['admin', 'election_admin', 'voter']).optional(),
  category: z.string().optional(),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  avatar: z.string().optional(),
});

export const electionSchema = z.object({
  title: z.string().min(1, 'Judul pemilihan wajib diisi.').max(200),
  description: z.string().max(2000).optional().default(''),
  startTime: z.string().min(1, 'Waktu mulai wajib diisi.'),
  endTime: z.string().min(1, 'Waktu selesai wajib diisi.'),
  rules: z.any().optional(),
});

export const updateElectionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['draft', 'published', 'active', 'closed']).optional(),
  rules: z.any().optional(),
});

export const candidateSchema = z.object({
  name: z.string().min(1, 'Nama kandidat wajib diisi.').max(200),
  description: z.string().max(2000).optional().default(''),
  image: z.string().optional().default(''),
  electionId: z.string().uuid('ID pemilihan tidak valid.'),
});

export const updateCandidateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  image: z.string().optional(),
});

export const voteSchema = z.object({
  electionId: z.string().uuid('ID pemilihan tidak valid.'),
  candidateId: z.string().uuid('ID kandidat tidak valid.'),
});

export const announcementSchema = z.object({
  title: z.string().min(1, 'Judul pengumuman wajib diisi.').max(300),
  content: z.string().min(1, 'Isi pengumuman wajib diisi.').max(10000),
  category: z.enum(['PENTING', 'INFORMASI', 'PANDUAN', 'UMUM']).optional().default('INFORMASI'),
  imageUrl: z.string().optional().default(''),
  isPinned: z.boolean().optional().default(false),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).max(10000).optional(),
  category: z.enum(['PENTING', 'INFORMASI', 'PANDUAN', 'UMUM']).optional(),
  imageUrl: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export const settingsSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  tagline: z.string().max(300).optional(),
  defaultLanguage: z.enum(['id', 'en']).optional(),
  timezone: z.string().max(50).optional(),
  emailNotification: z.boolean().optional(),
  autoClose: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  maxCandidates: z.number().int().min(1).max(100).optional(),
  minVoterThreshold: z.number().int().min(0).max(100).optional(),
  primaryColor: z.string().max(20).optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

export const uploadSchema = z.object({
  file: z.string().min(1, 'File (base64 string) harus disertakan.'),
  folder: z.string().max(100).optional().default('e-voting'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi.').max(100).optional(),
  avatar: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token reset wajib diisi.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.').max(128),
});

/**
 * Helper to validate request body with a Zod schema.
 * Returns { success: true, data } or { success: false, message }.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): 
  { success: true; data: T } | { success: false; message: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, message: firstError?.message || 'Data tidak valid.' };
}
