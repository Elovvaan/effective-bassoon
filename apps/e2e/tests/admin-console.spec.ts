import { expect, test } from '@playwright/test'

import { loginAsRole } from './helpers/auth'

test.describe('Admin console', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'district_admin')
    await page.goto('/admin')
    await expect(page.getByTestId('admin-console-page')).toBeVisible()
  })

  test('district admin can view schools, users, and classes', async ({ page }) => {
    await expect(page.getByTestId('user-management-section')).toBeVisible()
    await expect(page.getByTestId('school-management-section')).toBeVisible()
    await expect(page.getByTestId('class-management-section')).toBeVisible()
  })

  test('district admin can create and edit a user', async ({ page }) => {
    const seed = Date.now()
    const createdEmail = `e2e.user.${seed}@metro.demo`
    const updatedFirstName = `Edited${seed}`

    await page.getByTestId('user-first-name-input').fill('E2E')
    await page.getByTestId('user-last-name-input').fill('Tester')
    await page.getByTestId('user-email-input').fill(createdEmail)
    await page.getByTestId('user-role-select').selectOption('student')
    await page.getByTestId('user-submit-button').click()

    await expect(page.getByText(createdEmail)).toBeVisible()

    const createdUserRow = page.locator('tr', { hasText: createdEmail })
    await createdUserRow.getByTestId('user-edit-button').click()

    await page.getByTestId('user-first-name-input').fill(updatedFirstName)
    await page.getByTestId('user-submit-button').click()

    await expect(page.locator('tr', { hasText: createdEmail })).toContainText(updatedFirstName)
  })

  test('district admin can view class roster table', async ({ page }) => {
    const rosterTable = page.getByTestId('class-management-section').locator('table')
    await expect(rosterTable).toBeVisible()
    await expect(rosterTable.locator('tbody tr').first()).toBeVisible()
  })

  test('school admin can access admin console but not district-only school management', async ({ page, context }) => {
    await context.clearCookies()
    await loginAsRole(page, 'school_admin')
    await page.goto('/admin')

    await expect(page.getByTestId('user-management-section')).toBeVisible()
    await expect(page.getByTestId('class-management-section')).toBeVisible()
    await expect(page.getByTestId('school-management-section')).toHaveCount(0)
  })
})
