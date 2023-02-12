import type React from 'react';
import type { MouseEvent as ReactMouseEvent, PropsWithChildren } from 'react';
import { useRef, useEffect, Children, useCallback, useState } from 'react';
import './Slider.scss';

enum Visbility {
    FULL,
    PARTIAL,
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
    const partiallyVisibleSlideIndices = useRef<number[]>([]);

    const [isScrollable, setIsScrollable] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isBlockingClicks, setIsBlockingClicks] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<{ clientX: number; scrollX: number }>({
        clientX: 0,
        scrollX: 0,
    });

    const arrowPrevRef = useRef<HTMLButtonElement>(null);
    const arrowNextRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper) {
            return () => {};
        }

        const checkScrollable = () => setIsScrollable(currentWrapper.classList.toggle('is-scrollable', currentWrapper.scrollWidth > currentWrapper.clientWidth));

        window?.addEventListener('resize', checkScrollable);

        checkScrollable();

        return () => {
            window?.removeEventListener('resize', checkScrollable);
        };
    }, [wrapper]);

    useEffect(() => {
        wrapper.current?.classList.toggle('is-scrollable', isScrollable);
    }, [isScrollable]);

    useEffect(() => {
        wrapper.current?.classList.toggle('is-dragging', isDragging);

        const onDocumentMouseUp = (event: MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();

            setIsBlockingClicks(false);
            setIsDragging(false);
        };

        if (isDragging) {
            document?.addEventListener('mouseup', onDocumentMouseUp);
        }

        return () => {
            document?.removeEventListener('mouseup', onDocumentMouseUp);
        };
    }, [isDragging]);

    const blockChildClickHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        if (isBlockingClicks) {
            event.stopPropagation();
            event.preventDefault();
        }

        setIsBlockingClicks(false);
    };

    const mouseUpHandler = () => {
        setIsDragging(false);
    };

    const mouseDownHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        setMousePosition({
            ...mousePosition,
            clientX: event.clientX,
            scrollX: wrapper.current?.scrollLeft ?? 0,
        });

        setIsDragging(true);
    };

    const mouseMoveHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        if (!wrapper.current || !isDragging) {
            return;
        }

        if (Math.abs(mousePosition.clientX - event.clientX) > 5) {
            setIsBlockingClicks(true);
        }

        wrapper.current.scrollLeft = mousePosition.scrollX + mousePosition.clientX - event.clientX;
    };

    const addSlide = (node: HTMLDivElement, index: number) => {
        slides.current[index] = {
            element: node,
            visibility: Visbility.NONE,
        };
    };

    const getFirstVisibleSlideIndex = (): number => visibleSlideIndices.current[0] ?? partiallyVisibleSlideIndices.current[0] ?? -1;

    const getLastVisibleSlideIndex = (): number => visibleSlideIndices.current[visibleSlideIndices.current.length - 1]
        ?? partiallyVisibleSlideIndices.current[partiallyVisibleSlideIndices.current.length - 1] ?? -1;

    const setControlsVisibility = useCallback(() => {
        const lastSlideFullyVisible = getLastVisibleSlideIndex() + 1 === slides.current.length;
        const moreContentAvailable = isScrollable && lastSlideFullyVisible === false;
        const previousContentAvailable = getFirstVisibleSlideIndex() > 0 && isScrollable;

        if (arrowNextRef.current && arrowPrevRef.current) {
            arrowNextRef.current.classList.toggle('slider__button--hidden', moreContentAvailable === false);
            arrowNextRef.current.ariaHidden = String(moreContentAvailable === false);

            arrowPrevRef.current.classList.toggle('slider__button--hidden', previousContentAvailable === false);
            arrowPrevRef.current.ariaHidden = String(previousContentAvailable === false);
        }
    }, [isScrollable]);

    const getVisibilityByIntersectionRatio = (intersectionRatio: number) => {
        if (intersectionRatio >= 0.9) {
            return Visbility.FULL;
        }

        if (intersectionRatio >= 0.5) {
            return Visbility.PARTIAL;
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

                if (getVisibilityByIntersectionRatio(entry.intersectionRatio) === Visbility.PARTIAL) {
                    partiallyVisibleSlideIndices.current.push(index);
                } else {
                    partiallyVisibleSlideIndices.current = partiallyVisibleSlideIndices.current.filter((slideIndex) => slideIndex !== index);
                }
            });

            // Make sure there are no duplicate visible slides, then sort to retain proper order
            visibleSlideIndices.current = [...new Set(visibleSlideIndices.current)].sort((a, b) => a - b);
            partiallyVisibleSlideIndices.current = [...new Set(partiallyVisibleSlideIndices.current)].sort((a, b) => a - b);

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
            <div className="slider__wrapper" role="list" ref={wrapper}
                onMouseDown={mouseDownHandler}
                onMouseMove={mouseMoveHandler}
                onMouseUp={mouseUpHandler}
                onClickCapture={blockChildClickHandler}
            >
                {Children.map(children, (child, index: number) => (
                    <div className="slider__wrapper__slide" role="listitem" key={index} data-slide-index={index} ref={(node) => { if (node) { addSlide(node, index); } }}>
                        {child}
                    </div>
                ))}
            </div>
            <button
                aria-label="Previous slide"
                type="button"
                onClick={() => navigate(NavigationDirection.PREV)}
                ref={arrowPrevRef}
                className="slider__button slider__button--prev slider__button--hidden"
            >
                <svg fill="#33333" viewBox="0 0 256 256" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="M160,220a11.96287,11.96287,0,0,1-8.48535-3.51465l-80-80a12.00062,12.00062,0,0,1,0-16.9707l80-80a12.0001,12.0001,0,0,1,16.9707,16.9707L96.9707,128l71.51465,71.51465A12,12,0,0,1,160,220Z"></path>
                    </g>
                </svg>
            </button>
            <button
                aria-label="Next slide"
                type="button"
                onClick={() => navigate(NavigationDirection.NEXT)}
                ref={arrowNextRef}
                className="slider__button slider__button--next slider__button--hidden"
            >
                <svg fill="#333333" viewBox="0 0 256 256" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <path d="M96,220a12,12,0,0,1-8.48535-20.48535L159.0293,128,87.51465,56.48535a12.0001,12.0001,0,0,1,16.9707-16.9707l80,80a12.00062,12.00062,0,0,1,0,16.9707l-80,80A11.96287,11.96287,0,0,1,96,220Z"></path>
                    </g>
                </svg>
            </button>
        </div>
    );
};
