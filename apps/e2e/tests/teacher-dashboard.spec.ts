import { expect, test } from '@playwright/test'

import { loginAsRole, openAnalytics } from './helpers/auth'

test.describe('Teacher dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'teacher')
    await page.goto('/teacher')
    await expect(page.getByTestId('teacher-dashboard-page')).toBeVisible()
  })

  test('teacher sees classes, assignments, and submission statuses', async ({ page }) => {
    await expect(page.getByTestId('teacher-classes-section')).toBeVisible()
    await expect(page.getByTestId('teacher-assignments-section')).toBeVisible()
    await expect(page.getByTestId('teacher-submissions-section')).toBeVisible()
  })

  test('teacher can open analytics and view class-level metrics table', async ({ page }) => {
    await openAnalytics(page)
    await expect(page.getByTestId('scope-metrics-table')).toContainText('class')
  })
})
