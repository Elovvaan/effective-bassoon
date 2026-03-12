import { expect, type Page } from '@playwright/test'

export type DemoRole = 'district_admin' | 'school_admin' | 'teacher' | 'student'

const DEMO_PASSWORD = 'Password123!'

const DEMO_EMAILS: Record<DemoRole, string> = {
  district_admin: 'district.admin@metro.demo',
  school_admin: 'principal.nhs@metro.demo',
  teacher: 'teacher1@metro.demo',
  student: 'student1@metro.demo',
}

const DASHBOARD_PATH: Record<DemoRole, string> = {
  district_admin: '/admin',
  school_admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export async function loginAsRole(page: Page, role: DemoRole): Promise<void> {
  await page.goto('/')
  await expect(page.getByTestId('login-page')).toBeVisible()

  await page.getByTestId('login-email-input').fill(DEMO_EMAILS[role])
  await page.getByTestId('login-password-input').fill(DEMO_PASSWORD)
  await page.getByTestId('login-submit-button').click()

  await expect(page).toHaveURL(new RegExp(`${DASHBOARD_PATH[role]}$`))
}

export async function openAnalytics(page: Page): Promise<void> {
  await page.getByTestId('nav-link-analytics').click()
  await expect(page).toHaveURL(/\/analytics$/)
  await expect(page.getByTestId('analytics-page')).toBeVisible()
}
