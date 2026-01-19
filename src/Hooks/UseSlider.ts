import { useRef } from 'react';

export enum Visibility {
    FULL,
    PARTIAL,
    NONE,
}

export enum NavigationDirection {
    PREV,
    NEXT,
}

interface UseSlider {
    getPositionToScrollTo: (direction: NavigationDirection, slideOffset: number, wrapperOffset: number, wrapperDimension: number, slideDimension: number) => number;
    getVisibilityByIntersectionRatio: (intersectionRatio: number) => Visibility;
    getFirstVisibleSlideIndex: () => number;
    getLastVisibleSlideIndex: () => number;
    addVisibleSlide: (index: number) => void;
    addPartiallyVisibleSlide: (index: number) => void;
    sortSlides: () => void;
    removeVisibleSlide: (index: number) => void;
    removePartiallyVisibleSlide: (index: number) => void;
    shouldBlockClicks: (delta: number) => boolean;
}

export const useSlider = (): UseSlider => {
    const visibleSlideIndices = useRef<number[]>([]);
    const partiallyVisibleSlideIndices = useRef<number[]>([]);

    const getFirstVisibleSlideIndex = (): number => visibleSlideIndices.current[0] ?? partiallyVisibleSlideIndices.current[0] ?? -1;

    const getLastVisibleSlideIndex = (): number => visibleSlideIndices.current[visibleSlideIndices.current.length - 1]
        ?? partiallyVisibleSlideIndices.current[partiallyVisibleSlideIndices.current.length - 1] ?? -1;

    const addVisibleSlide = (index: number) => visibleSlideIndices.current.push(index);

    const addPartiallyVisibleSlide = (index: number) => partiallyVisibleSlideIndices.current.push(index);

    const removePartiallyVisibleSlide = (index: number) => {
        partiallyVisibleSlideIndices.current = partiallyVisibleSlideIndices.current.filter((slideIndex) => slideIndex !== index);
    }

    const removeVisibleSlide = (index: number) => {
        visibleSlideIndices.current = visibleSlideIndices.current.filter((slideIndex) => slideIndex !== index);
    }

    const sortSlides = () => {
        // Make sure there are no duplicate visible slides, then sort to retain proper order
        visibleSlideIndices.current = [...new Set(visibleSlideIndices.current)].sort((a, b) => a - b);
        partiallyVisibleSlideIndices.current = [...new Set(partiallyVisibleSlideIndices.current)].sort((a, b) => a - b);
    };

    const shouldBlockClicks = (delta: number) => {
        return Math.abs(delta) > 5;
    };

    const getPositionToScrollTo = (direction: NavigationDirection, slideOffset: number, wrapperOffset: number, wrapperDimension: number, slideDimension: number) => {
        let scroll = 0;

        if (direction === NavigationDirection.PREV) {
            scroll = slideOffset - wrapperOffset - wrapperDimension + slideDimension;
        } else {
            scroll = slideOffset - wrapperOffset;
        }

        return scroll;
    };

    const getVisibilityByIntersectionRatio =  (intersectionRatio: number) => {
        if (intersectionRatio >= 0.9) {
            return Visibility.FULL;
        }

        if (intersectionRatio >= 0.5) {
            return Visibility.PARTIAL;
        }

        return Visibility.NONE;
    };

    return {
        addVisibleSlide,
        addPartiallyVisibleSlide,
        removePartiallyVisibleSlide,
        removeVisibleSlide,
        sortSlides,
        getFirstVisibleSlideIndex,
        getLastVisibleSlideIndex,
        getPositionToScrollTo,
        getVisibilityByIntersectionRatio,
        shouldBlockClicks,
    };
};
