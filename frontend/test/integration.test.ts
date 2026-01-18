/**
 * Integration tests for the AI Todo Interface frontend
 * Testing the requested functionality:
 * - "Add a task to buy milk"
 * - "Show my tasks"
 * - "Mark task 1 as done"
 */

import { test, expect, beforeEach, afterEach } from '@playwright/test';

// Base URL for the application
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Mock user ID for testing
const MOCK_USER_ID = 'test-user-123';

test.describe('AI Todo Interface Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting a session cookie or localStorage
    // In a real test, this would involve actual authentication
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: MOCK_USER_ID,
            email: 'test@example.com',
            name: 'Test User'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      });
    });

    // Mock the backend API responses
    await page.route('**/api/*/chat', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      const message = postData?.message?.toLowerCase();

      let response;

      if (message.includes('add') && message.includes('milk')) {
        response = {
          success: true,
          conversation_id: 'test-convo-123',
          response: "I've added the task 'buy milk' to your list.",
          actions_taken: [{
            action: 'task_created',
            details: {
              task_id: 'task-1',
              title: 'buy milk'
            }
          }],
          timestamp: new Date().toISOString()
        };
      } else if (message.includes('show') || message.includes('list') || message.includes('my tasks')) {
        response = {
          success: true,
          conversation_id: 'test-convo-123',
          response: "Here are your tasks:\n1. buy milk (pending)",
          actions_taken: [{
            action: 'list_returned',
            details: {
              task_count: 1,
              tasks: [{
                id: 'task-1',
                title: 'buy milk',
                status: 'pending'
              }]
            }
          }],
          timestamp: new Date().toISOString()
        };
      } else if (message.includes('mark') && message.includes('done') && message.includes('task 1')) {
        response = {
          success: true,
          conversation_id: 'test-convo-123',
          response: "I've marked the task 'buy milk' as completed.",
          actions_taken: [{
            action: 'task_completed',
            details: {
              task_id: 'task-1',
              title: 'buy milk'
            }
          }],
          timestamp: new Date().toISOString()
        };
      } else {
        response = {
          success: true,
          conversation_id: 'test-convo-123',
          response: "I've processed your request.",
          actions_taken: [],
          timestamp: new Date().toISOString()
        };
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  });

  test('full integration flow: add task, show tasks, mark as done', async ({ page }) => {
    // Navigate to the chat page
    await page.goto(BASE_URL);

    // Wait for the page to load and verify the chat interface is present
    await expect(page.locator('h1')).toContainText('AI Todo Assistant');
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // Step 1: Add a task to buy milk
    await page.fill('input[type="text"]', 'Add a task to buy milk');
    await page.click('button[type="submit"]');

    // Wait for the response
    await page.waitForSelector('text=I\'ve added the task \'buy milk\' to your list.');
    await expect(page.locator('text=buy milk')).toBeVisible();

    // Step 2: Show my tasks
    await page.fill('input[type="text"]', 'Show my tasks');
    await page.click('button[type="submit"]');

    // Wait for the response
    await page.waitForSelector('text=Here are your tasks:');
    await expect(page.locator('text=buy milk')).toBeVisible();

    // Step 3: Mark task 1 as done
    await page.fill('input[type="text"]', 'Mark task 1 as done');
    await page.click('button[type="submit"]');

    // Wait for the response
    await page.waitForSelector('text=I\'ve marked the task \'buy milk\' as completed.');
    await expect(page.locator('text=marked the task')).toBeVisible();

    // Verify the full flow worked as expected
    await expect(page.locator('text=buy milk')).toHaveCount(3); // Should appear in 3 different messages
  });

  test('verify ChatKit UI integration', async ({ page }) => {
    // Navigate to the chat page
    await page.goto(BASE_URL);

    // Verify ChatKit UI elements are present
    await expect(page.locator('h2')).toContainText('AI Todo Assistant');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify example text is present
    await expect(page.locator('text=Example: "Add a task to buy milk"')).toBeVisible();

    // Verify welcome message is displayed
    await expect(page.locator('text=Hello! I\'m your AI assistant for managing your todo list.')).toBeVisible();
  });

  test('verify API connection', async ({ page }) => {
    // Navigate to the chat page
    await page.goto(BASE_URL);

    // Send a test message
    await page.fill('input[type="text"]', 'Test message');
    await page.click('button[type="submit"]');

    // Verify that a response is received
    await page.waitForFunction(() => {
      return document.querySelectorAll('[data-testid="ai-message"]').length > 0;
    });
  });
});