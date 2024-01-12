import { NavigationDirection, useSlider, Visibility } from './UseSlider';
import { renderHook } from '@testing-library/react';

describe('UseSlider', () => {
    describe('keeps track of slides', () => {
        it('gets the first fully visible slide', () => {
            const { result } = renderHook(() => useSlider());

            result.current.addPartiallyVisibleSlide(1);
            result.current.addVisibleSlide(2);
            result.current.addVisibleSlide(3);


            expect(result.current.getFirstVisibleSlideIndex()).toBe(2);
        });

        it('gets the last fully visible slide', () => {
            const { result } = renderHook(() => useSlider());

            result.current.addVisibleSlide(1);
            result.current.addVisibleSlide(2);
            result.current.addPartiallyVisibleSlide(3);

            expect(result.current.getLastVisibleSlideIndex()).toBe(2);
        });


        it('gets the first partially visible slide when no slide is fully visible', () => {
            const { result } = renderHook(() => useSlider());

            result.current.addPartiallyVisibleSlide(1);
            result.current.addPartiallyVisibleSlide(2);

            expect(result.current.getFirstVisibleSlideIndex()).toBe(1);
        });

        it('gets the last visible slide when no slide is fully visible', () => {
            const { result } = renderHook(() => useSlider());

            result.current.addPartiallyVisibleSlide(1);
            result.current.addPartiallyVisibleSlide(2);

            expect(result.current.getLastVisibleSlideIndex()).toBe(2);
        });


        it('falls back when first slide is non-existant', () => {
            const { result } = renderHook(() => useSlider());
            expect(result.current.getFirstVisibleSlideIndex()).toBe(-1);
        });


        it('falls back when last slide is non-existant', () => {
            const { result } = renderHook(() => useSlider());
            expect(result.current.getLastVisibleSlideIndex()).toBe(-1);
        });

        it('sorts the fully visible slides by index', () => {
            const { result } = renderHook(() => useSlider());

            result.current.addVisibleSlide(3);
            result.current.addVisibleSlide(2);
            result.current.addVisibleSlide(1);

            expect(result.current.getFirstVisibleSlideIndex()).toBe(3);
            expect(result.current.getLastVisibleSlideIndex()).toBe(1);

            result.current.sortSlides();

            expect(result.current.getLastVisibleSlideIndex()).toBe(3);
        });

        it('sorts the partially fully visible slides by index', () => {
            const { result } = renderHook(() => useSlider());

            result.current.addPartiallyVisibleSlide(3);
            result.current.addPartiallyVisibleSlide(2);
            result.current.addPartiallyVisibleSlide(1);

            expect(result.current.getFirstVisibleSlideIndex()).toBe(3);
            expect(result.current.getLastVisibleSlideIndex()).toBe(1);

            result.current.sortSlides();

            expect(result.current.getLastVisibleSlideIndex()).toBe(3);
        });
    });

    describe('calculations', () => {
        it('calculates whether to block a click when sliding', () => {
            const { result } = renderHook(() => useSlider());

            expect(result.current.shouldBlockClicks(5)).toBe(false);
            expect(result.current.shouldBlockClicks(6)).toBe(true);
        });

        it('calculates the scrollLeft position (next)', () => {
            const { result } = renderHook(() => useSlider());

            expect(result.current.getPositionToScrollTo(NavigationDirection.NEXT, 200, 50, 1250, 325)).toBe(150);
        });

        it('calculates the scrollLeft position (prev)', () => {
            const { result } = renderHook(() => useSlider());

            expect(result.current.getPositionToScrollTo(NavigationDirection.PREV, 875, 50, 1250, 325)).toBe(-100);
        });

        it('calculates the visibility of a slide', () => {
            const { result } = renderHook(() => useSlider());

            [
                [0.0, Visibility.NONE],
                [0.1, Visibility.NONE],
                [0.2, Visibility.NONE],
                [0.3, Visibility.NONE],
                [0.4, Visibility.NONE],
                [0.5, Visibility.PARTIAL],
                [0.6, Visibility.PARTIAL],
                [0.7, Visibility.PARTIAL],
                [0.8, Visibility.PARTIAL],
                [0.9, Visibility.FULL],
                [1.0, Visibility.FULL],
            ].forEach(([ratio, expectation]) => {
                expect(result.current.getVisibilityByIntersectionRatio(ratio)).toBe(expectation);
            });
        });
    });
});