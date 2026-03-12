import { expect, test } from '@playwright/test'

import { loginAsRole } from './helpers/auth'

test.describe('Student portal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRole(page, 'student')
    await page.goto('/student')
    await expect(page.getByTestId('student-portal-page')).toBeVisible()
  })

  test('student sees active assignments', async ({ page }) => {
    await expect(page.getByTestId('student-active-assignments-section')).toBeVisible()
  })

  test('student submits work and sees updated submission status', async ({ page }) => {
    const assignmentOptions = page.locator('[data-testid="student-assignment-select"] option')
    await expect(assignmentOptions).toHaveCount(2)

    const selectedAssignmentId = await assignmentOptions.nth(1).getAttribute('value')
    if (!selectedAssignmentId) {
      throw new Error('Expected an assignment option with a value for submission')
    }

    await page.getByTestId('student-assignment-select').selectOption({ index: 1 })
    await page.getByTestId('student-classroom-select').selectOption({ index: 1 })
    await page.getByTestId('student-submit-button').click()

    await expect(page.getByTestId('student-submissions-section')).toContainText('SUBMITTED')
    await expect(page.getByTestId('student-submissions-section')).toContainText(selectedAssignmentId)
  })
})
