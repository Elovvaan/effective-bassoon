import { expect, test } from '@playwright/test'

import { loginAsRole, openAnalytics } from './helpers/auth'

test.describe('Analytics access', () => {
  test('district admin sees district-level metrics', async ({ page }) => {
    await loginAsRole(page, 'district_admin')
    await openAnalytics(page)

    await expect(page.getByTestId('district-metrics-list')).toContainText('Active users')
    await expect(page.getByTestId('scope-metrics-table')).toContainText('district')
  })

  test('school admin sees school-level metrics', async ({ page }) => {
    await loginAsRole(page, 'school_admin')
    await openAnalytics(page)

    await expect(page.getByTestId('scope-metrics-table')).toContainText('school')
  })

  test('teacher sees class-level metrics', async ({ page }) => {
    await loginAsRole(page, 'teacher')
    await openAnalytics(page)

    await expect(page.getByTestId('scope-metrics-table')).toContainText('class')
  })
})
