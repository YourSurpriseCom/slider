import React, { useRef, useEffect, Children, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import './Slider.scss';

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
    const slides = useRef<SlideVisibilityEntry[]>([]);
    const wrapper = useRef<HTMLDivElement>(null);
    const visibleSlideIndices = useRef<number[]>([]);

    const arrowPrevRef = useRef<HTMLButtonElement>(null);
    const arrowNextRef = useRef<HTMLButtonElement>(null);

    const moreContentFade = useRef<HTMLDivElement>(null);
    const lessContentFade = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentContainer = wrapper.current;

        if (!currentContainer) {
            return () => {};
        }

        let mousePosition = {
            left: 0, top: 0, x: 0, y: 0,
        };

        const mouseMoveHandler = (event: MouseEvent) => {
            currentContainer.scrollLeft = mousePosition.left - (event.clientX - mousePosition.x);
        };

        const mouseUpHandler = () => {
            currentContainer.removeEventListener('mousemove', mouseMoveHandler);
            currentContainer.removeEventListener('mouseup', mouseUpHandler);
            currentContainer.classList.remove('is-dragging');
        };

        const mouseDownHandler = (e: MouseEvent) => {
            mousePosition = {
                left: currentContainer.scrollLeft,
                top: currentContainer.scrollTop,
                x: e.clientX,
                y: e.clientY,
            };

            // Add the mouseup event listener to the document, so we won't miss it when the event is triggered on another element
            document?.addEventListener('mouseup', mouseUpHandler);
            currentContainer.addEventListener('mousemove', mouseMoveHandler);
            currentContainer.classList.add('is-dragging');
        };

        currentContainer.addEventListener('mousedown', mouseDownHandler);

        return () => {
            document?.removeEventListener('mouseup', mouseUpHandler);
            currentContainer.removeEventListener('mousedown', mouseDownHandler);
            currentContainer.removeEventListener('mousemove', mouseMoveHandler);
            currentContainer.classList.remove('is-dragging');
        };
    }, []);

    const addSlide = (node: HTMLDivElement, index: number) => {
        slides.current[index] = {
            element: node,
            visibility: Visbility.NONE,
        };
    };

    const getFirstVisibleSlideIndex = (): number => visibleSlideIndices.current[0] ?? -1;
    const getLastVisibleSlideIndex = (): number => visibleSlideIndices.current[visibleSlideIndices.current.length - 1] ?? -1;
    const setControlsVisibility = useCallback(() => {
        const lastSlideFullyVisible = getLastVisibleSlideIndex() + 1 === slides.current.length;

        if (arrowNextRef.current && arrowPrevRef.current) {
            arrowNextRef.current.classList.toggle('hidden', lastSlideFullyVisible);
            arrowNextRef.current.ariaHidden = String(lastSlideFullyVisible);

            arrowPrevRef.current.classList.toggle('hidden', getFirstVisibleSlideIndex() === 0);
            arrowPrevRef.current.ariaHidden = String(getFirstVisibleSlideIndex() === 0);
        }

        if (moreContentFade.current) {
            moreContentFade.current.classList.toggle('hidden', lastSlideFullyVisible);
            moreContentFade.current.ariaHidden = String(lastSlideFullyVisible);
        }

        if (lessContentFade.current) {
            lessContentFade.current.classList.toggle('hidden', getFirstVisibleSlideIndex() === 0);
            lessContentFade.current.ariaHidden = String(getFirstVisibleSlideIndex() === 0);
        }
    }, []);

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
        if (!wrapper.current) {
            return () => {};
        }

        setControlsVisibility();

        const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                const target = entry.target as HTMLDivElement;
                const index = Number(target.dataset.slideIndex);

                if (getVisibilityByIntersectionRatio(entry.intersectionRatio) === Visbility.FULL) {
                    visibleSlideIndices.current.push(index);
                } else {
                    visibleSlideIndices.current = visibleSlideIndices.current.filter((slideIndex) => slideIndex !== index);
                }
            });

            // Make sure there are no duplicate visible slides, then sort to retain proper order
            visibleSlideIndices.current = [...new Set(visibleSlideIndices.current)].sort();
            setControlsVisibility();
        };

        const intersectionObserver = new IntersectionObserver(intersectionCallback, {
            root: wrapper.current,
            threshold: [0, 0.5, 0.9],
        });

        slides.current.forEach(({ element }) => intersectionObserver.observe(element));

        return () => intersectionObserver.disconnect();
    }, [wrapper, setControlsVisibility]);

    const navigate = (direction: NavigationDirection) => {
        if (!wrapper.current) {
            return;
        }

        const targetSlideIndex = direction === NavigationDirection.PREV ? getFirstVisibleSlideIndex() - 1 : getLastVisibleSlideIndex() + 1;
        const targetSlide = slides.current[targetSlideIndex];
        let scrollLeft = 0;

        if (!targetSlide) {
            return;
        }

        if (direction === NavigationDirection.PREV) {
            scrollLeft = targetSlide.element.offsetLeft - wrapper.current.offsetLeft - wrapper.current.clientWidth + targetSlide.element.clientWidth;
        } else {
            scrollLeft = targetSlide.element.offsetLeft - wrapper.current.offsetLeft;
        }

        wrapper.current.scrollTo({ behavior: 'smooth', left: scrollLeft, top: 0 });
    };

    return (
        <div className="slider">
            <div className="slider__wrapper" role="list" ref={wrapper}>
                {Children.map(children, (child, index: number) => (
                    <div className="slider__wrapper__slide" role="listitem" key={index} data-slide-index={index} ref={(node) => { if (node) { addSlide(node, index); } }}>
                        {child}
                    </div>
                ))}
            </div>

            <div className="slider__scroll_indicator slider__scroll_indicator--prev-available" data-testid="less-content" ref={lessContentFade} />
            <div className="slider__scroll_indicator slider__scroll_indicator--next-available" data-testid="more-content" ref={moreContentFade} />

            <button
                aria-label="Previous slide"
                type="button"
                onClick={() => navigate(NavigationDirection.PREV)}
                ref={arrowPrevRef}
                className="slider__button slider__button--prev button button--ghost button--clean button--has-icon"
            >
                <i className="icon-chevron-left" />
            </button>
            <button
                aria-label="Next slide"
                type="button"
                onClick={() => navigate(NavigationDirection.NEXT)}
                ref={arrowNextRef}
                className="slider__button slider__button--next button button--ghost button--clean button--has-icon"
            >
                <i className="icon-chevron-right" />
            </button>
        </div>
    );
};
