import type { Request, Response } from 'express'
import { getSalaryAnalytics } from '../services/analytics.service.js'

export async function getAnalytics(_req: Request, res: Response) {
  try {
    res.json({ success: true, ...(await getSalaryAnalytics()) })
  } catch (error) {
    console.error('Error fetching salary analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary analytics',
    })
  }
}
