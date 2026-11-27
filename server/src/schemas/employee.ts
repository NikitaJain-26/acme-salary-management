import { z } from 'zod'
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUSES,
  getEmployeeCountry,
} from '../constants/employee.js'

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
  countryCode: z.string()
    .trim()
    .toUpperCase()
    .refine((code) => getEmployeeCountry(code) !== undefined),
  department: z.string()
    .trim()
    .min(1)
    .max(100)
    .refine((department) => EMPLOYEE_DEPARTMENTS.some(
      (option) => option === department,
    )),
  jobTitle: z.string().trim().min(1).max(100),
  status: z.preprocess(
    (value) => value === null ? undefined : value,
    z.enum(EMPLOYEE_STATUSES).default('ACTIVE'),
  ),
  hireDate: z.string().trim().refine(isValidDateInput),
  salary: employeeSalarySchema,
}).superRefine((employee, context) => {
  if (!employee.salary) {
    return
  }

  const country = getEmployeeCountry(employee.countryCode)
  if (country && employee.salary.currencyCode !== country.currency) {
    context.addIssue({
      code: 'custom',
      path: ['salary', 'currencyCode'],
      message: 'Salary currency must match the selected country',
    })
  }
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
