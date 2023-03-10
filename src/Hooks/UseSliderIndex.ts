import { useRef } from 'react';

interface UseSliderIndex {
    getFirstVisibleSlideIndex: () => number;
    getLastVisibleSlideIndex: () => number;
    addVisibleSlide: (index: number) => void;
    addPartiallyVisibleSlide: (index: number) => void;
    sortSlides: () => void;
    removeVisibleSlide: (index: number) => void;
    removePartiallyVisibleSlide: (index: number) => void;
}

export const useSliderIndex = (): UseSliderIndex => {
    const visibleSlideIndices = useRef<number[]>([]);
    const partiallyVisibleSlideIndices = useRef<number[]>([]);

    const getFirstVisibleSlideIndex = (): number => visibleSlideIndices.current[0] ?? partiallyVisibleSlideIndices.current[0] ?? -1;

    const getLastVisibleSlideIndex = (): number => visibleSlideIndices.current[visibleSlideIndices.current.length - 1]
        ?? partiallyVisibleSlideIndices.current[partiallyVisibleSlideIndices.current.length - 1] ?? -1;

    return {
        addVisibleSlide: (index) => visibleSlideIndices.current.push(index),
        addPartiallyVisibleSlide: (index) => partiallyVisibleSlideIndices.current.push(index),
        removePartiallyVisibleSlide: (index) => partiallyVisibleSlideIndices.current = partiallyVisibleSlideIndices.current.filter((slideIndex) => slideIndex !== index),
        removeVisibleSlide: (index) => visibleSlideIndices.current = visibleSlideIndices.current.filter((slideIndex) => slideIndex !== index),
        sortSlides: () => {
            // Make sure there are no duplicate visible slides, then sort to retain proper order
            visibleSlideIndices.current = [...new Set(visibleSlideIndices.current)].sort((a, b) => a - b);
            partiallyVisibleSlideIndices.current = [...new Set(partiallyVisibleSlideIndices.current)].sort((a, b) => a - b);
        },
        getFirstVisibleSlideIndex,
        getLastVisibleSlideIndex,
    };
};
