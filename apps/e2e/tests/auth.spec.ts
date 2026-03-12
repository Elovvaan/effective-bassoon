import { expect, test } from '@playwright/test'

import { loginAsRole } from './helpers/auth'

test.describe('Authentication and role protection', () => {
  test('district admin login redirects to admin console', async ({ page }) => {
    await loginAsRole(page, 'district_admin')
    await expect(page.getByTestId('admin-console-title')).toBeVisible()
  })

  test('school admin login redirects to admin console', async ({ page }) => {
    await loginAsRole(page, 'school_admin')
    await expect(page.getByTestId('admin-console-title')).toBeVisible()
  })

  test('teacher login redirects to teacher dashboard', async ({ page }) => {
    await loginAsRole(page, 'teacher')
    await expect(page.getByTestId('teacher-dashboard-title')).toBeVisible()
  })

  test('student login redirects to student portal', async ({ page }) => {
    await loginAsRole(page, 'student')
    await expect(page.getByTestId('student-portal-title')).toBeVisible()
  })

  test('protected routes block role mismatches', async ({ page }) => {
    await loginAsRole(page, 'teacher')

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/teacher$/)

    await page.goto('/student')
    await expect(page).toHaveURL(/\/teacher$/)
  })
})
