import React from 'react';
import type { PropsWithChildren } from 'react';
import { useRef, useEffect, Children, useCallback } from 'react';
import './UpsellSlider.scss';

enum Visbility {
    FULL,
    HALF,
    NONE,
}

enum NavigationDirection {
    PREV,
    NEXT,
}

interface SlideVisibilityEntry {
    element: HTMLDivElement;
    visibility: Visbility;
}

export const Slider: React.FC<PropsWithChildren> = ({ children }) => {
    const container = useRef<HTMLDivElement>(null);
    const arrowPrevRef = useRef<HTMLButtonElement>(null);
    const arrowNextRef = useRef<HTMLButtonElement>(null);
    const slides = useRef<SlideVisibilityEntry[]>([]);
    const visibleSlideIndices = useRef<number[]>([]);
    const moreContentFade = useRef<HTMLDivElement>(null);

    const isSliderScrollable = useCallback(() => {
        if (!container.current) {
            return false;
        }

        return container.current.scrollWidth > container.current.clientWidth;
    }, []);

    const addSlide = (node: HTMLDivElement, index: number) => {
        slides.current[index] = {
            element: node,
            visibility: Visbility.NONE,
        };
    };

    const getFirstVisibleSlideIndex = (): number => visibleSlideIndices.current[0] ?? 0;
    const getLastVisibleSlideIndex = (): number => visibleSlideIndices.current[visibleSlideIndices.current.length - 1] ?? 0;

    const getVisibilityByIntersectionRatio = (intersectionRatio: number) => {
        if (intersectionRatio >= 0.9) {
            return Visbility.FULL;
        }

        if (intersectionRatio >= 0.5) {
            return Visbility.HALF;
        }

        return Visbility.NONE;
    };

    useEffect(() => {
        if (!container.current) {
            return () => {};
        }

        const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                const target = entry.target as HTMLDivElement;
                const index = Number(target.dataset.slideIndex);

                if (getVisibilityByIntersectionRatio(entry.intersectionRatio) === Visbility.FULL) {
                    visibleSlideIndices.current.push(index);
                } else {
                    // todo: this can probably be made more efficient, we filter because delete leaves an empty slot in the array
                    visibleSlideIndices.current = visibleSlideIndices.current.filter((slideIndex) => slideIndex !== index);
                }
            });

            // Make sure there are no duplicate visible slides, then sort to retain proper order
            visibleSlideIndices.current = [...new Set(visibleSlideIndices.current)].sort();

            if (arrowNextRef.current && arrowPrevRef.current) {
                const lastSlideFullyVisible = getLastVisibleSlideIndex() + 1 === slides.current.length;

                arrowNextRef.current.classList.toggle('hidden', !isSliderScrollable || lastSlideFullyVisible);
                arrowPrevRef.current.classList.toggle('hidden', !isSliderScrollable || getFirstVisibleSlideIndex() === 0);

                if (moreContentFade.current) {
                    moreContentFade.current.classList.toggle('hidden', !isSliderScrollable || lastSlideFullyVisible);
                }
            }
        };

        const intersectionObserver = new IntersectionObserver(intersectionCallback, { root: container.current, threshold: [0, 0.5, 0.9] });

        slides.current.forEach(({ element }) => intersectionObserver.observe(element));

        return () => intersectionObserver.disconnect();
    }, [container, isSliderScrollable]);

    const navigate = (direction: NavigationDirection) => {
        if (!container.current) {
            return;
        }

        const targetSlideIndex = direction === NavigationDirection.PREV ? getFirstVisibleSlideIndex() - 1 : getFirstVisibleSlideIndex() + 1;
        const targetSlide = slides.current[targetSlideIndex];

        if (!targetSlide) {
            return;
        }

        // Safari does not support .scrollIntoView with options
        container.current.scrollTo({
            behavior: 'smooth',
            left: targetSlide.element.offsetLeft - container.current.offsetLeft,
        });
    };

    return (
        <div className="scrollr-container">
            <button style={{ left: 0, position: 'absolute', top: '50%' }} ref={arrowPrevRef} onClick={() => navigate(NavigationDirection.PREV)}>Prev</button>
            <div className="more-content-fade" ref={ moreContentFade }/>
            <div className="scrollr" ref={container}>
                {Children.map(children, (child, index: number) => (
                    <div key={index} data-slide-index={index} ref={(node) => { if (node) { addSlide(node, index); } }}>
                        {child}
                    </div>
                ))}
            </div>
            <button style={{ position: 'absolute', right: 0, top: '50%' }} ref={arrowNextRef} onClick={() => navigate(NavigationDirection.NEXT)}>Next</button>
        </div>
    );
};
