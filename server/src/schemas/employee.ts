import { z } from 'zod'
import { EMPLOYEE_STATUSES } from '../constants/employee.js'

const isValidDateInput = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())

const employeeSalarySchema = z.union([
  z.object({
    amount: z.number().int().positive().max(2_147_483_647),
    currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
    effectiveFrom: z.string().trim().refine(isValidDateInput),
  }),
  z.object({
    amount: z.union([z.literal(''), z.null()]).optional(),
    currencyCode: z.string().optional(),
    effectiveFrom: z.string().optional(),
  }).transform(() => undefined),
]).nullish().transform((salary) => salary ?? undefined)

export const employeeCreateRequestSchema = z.object({
  employeeNumber: z.string().trim().min(1).max(32),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string()
    .trim()
    .toLowerCase()
    .max(254)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  department: z.string().trim().min(1).max(100),
  jobTitle: z.string().trim().min(1).max(100),
  status: z.preprocess(
    (value) => value === null ? undefined : value,
    z.enum(EMPLOYEE_STATUSES).default('ACTIVE'),
  ),
  hireDate: z.string().trim().refine(isValidDateInput),
  salary: employeeSalarySchema,
})

export const employeeSalaryUpdateRequestSchema = z.object({
  amount: z.number().int().positive(),
  currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  effectiveFrom: z.string().trim().min(1).refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
  ),
  reason: z.string().trim().transform((reason) => reason || undefined).optional(),
})

export type EmployeeCreateRequest = z.infer<typeof employeeCreateRequestSchema>
export type EmployeeSalaryUpdateRequest = z.infer<
  typeof employeeSalaryUpdateRequestSchema
>
