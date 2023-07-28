import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:1234/');

    await expect(page).toHaveTitle('Slider demo');
});

test('can drag with the mouse to progress the slider', async ({ page }) => {
    await page.goto('http://localhost:1234/');

    const firstSlider = await page.locator('.slider').first();
    const slides = await firstSlider.getByRole('listitem');
    const thirdSlide = slides.nth(2);
    const firstSlide = slides.first();

    await expect(firstSlide).toBeInViewport();

    await thirdSlide.dragTo(thirdSlide, {
        force: true,
        sourcePosition: {
            y: 100,
            x: 100,
        },
        targetPosition: {
            x: -300,
            y: 100,
        },
    });

    await expect(firstSlide).not.toBeInViewport();
    await expect(thirdSlide).toBeInViewport();

    await thirdSlide.dragTo(thirdSlide, {
        sourcePosition: {
            y: 100,
            x: 100,
        },
        force: true,
        targetPosition: {
            x: 600,
            y: 100,
        },
    });

    await expect(firstSlide).toBeInViewport();
});

test('can navigate with the buttons', async ({ page }) => {
    await page.goto('http://localhost:1234/');

    const firstSlider = await page.locator('.slider').first();
    const slides = await firstSlider.getByRole('listitem');

    const fourthSlide = slides.nth(3);
    const firstSlide = slides.first();

    const nextSlideButton = await firstSlider.getByLabel('Next slide').first();
    const prevSlideButton = await firstSlider.getByLabel('Previous slide').first();

    await expect(firstSlide).toBeInViewport();

    await nextSlideButton.click();

    await expect(firstSlide).not.toBeInViewport();
    await expect(fourthSlide).toBeInViewport();

    await prevSlideButton.click();

    await expect(firstSlide).toBeInViewport();
});

test('toggles the navigation buttons', async ({ page }) => {
    await page.goto('http://localhost:1234/');

    const firstSlider = await page.locator('.slider').first();

    const nextSlideButton = await firstSlider.getByLabel('Next slide').first();
    const prevSlideButton = await firstSlider.getByLabel('Previous slide').first();

    await expect(prevSlideButton).not.toBeVisible();
    await expect(nextSlideButton).toBeVisible();

    await nextSlideButton.click();

    await expect(prevSlideButton).toBeVisible();
    await expect(nextSlideButton).toBeVisible();

    await nextSlideButton.click();

    await nextSlideButton.click();

    await expect(prevSlideButton).toBeVisible();
    await expect(nextSlideButton).not.toBeVisible();
});