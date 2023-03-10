import classNames from 'classnames';
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

interface Settings {
    // Sets whether the navigation buttons (next/prev) are no longer rendered
    hideNavigationButtons?: boolean;
}

export const Slider: React.FC<PropsWithChildren<Settings>> = ({ children, hideNavigationButtons = false }) => {
    const slides = useRef<SlideVisibilityEntry[]>([]);
    const wrapper = useRef<HTMLDivElement>(null);
    const visibleSlideIndices = useRef<number[]>([]);
    const partiallyVisibleSlideIndices = useRef<number[]>([]);

    const [nextArrowVisible, setNextArrowVisible] = useState<boolean>(false);
    const [prevArrowVisible, setPrevArrowVisible] = useState<boolean>(false);

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

        const checkScrollable = () => setIsScrollable(currentWrapper.scrollWidth > currentWrapper.clientWidth);

        window?.addEventListener('resize', checkScrollable);

        checkScrollable();

        return () => {
            window?.removeEventListener('resize', checkScrollable);
        };
    }, [wrapper]);

    useEffect(() => {
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

        setPrevArrowVisible(getFirstVisibleSlideIndex() > 0 && isScrollable);
        setNextArrowVisible(isScrollable && lastSlideFullyVisible === false);
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

            if (hideNavigationButtons === false) {
                setControlsVisibility();
            }
        };

        const intersectionObserver = new IntersectionObserver(intersectionCallback, {
            root: wrapper.current,
            threshold: [0, 0.5, 0.9],
        });

        slides.current.forEach(({ element }) => intersectionObserver.observe(element));

        return () => intersectionObserver.disconnect();
    }, [wrapper, setControlsVisibility, hideNavigationButtons]);

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
            <div role="list" ref={wrapper}
                onMouseDown={mouseDownHandler}
                onMouseMove={mouseMoveHandler}
                onMouseUp={mouseUpHandler}
                onClickCapture={blockChildClickHandler}
                className={classNames('slider__wrapper', {
                    'is-scrollable': isScrollable,
                    'is-dragging': isDragging,
                })}
            >
                {Children.map(children, (child, index: number) => (
                    <div className="slider__wrapper__slide" role="listitem" key={index} data-slide-index={index} ref={(node) => { if (node) { addSlide(node, index); } }}>
                        {child}
                    </div>
                ))}
            </div>
            { hideNavigationButtons === false && (
                <button
                    aria-label="Previous slide"
                    type="button"
                    onClick={() => navigate(NavigationDirection.PREV)}
                    ref={arrowPrevRef}
                    aria-hidden={prevArrowVisible === false}
                    className={classNames([
                        'slider__button',
                        'slider__button--prev',
                        { 'slider__button--hidden': prevArrowVisible === false },
                    ])}
                >
                    <svg fill="#554c44" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
                        <path d="M160,216a8.5,8.5,0,0,1-5.7-2.3l-80-80a8.1,8.1,0,0,1,0-11.4l80-80a8.1,8.1,0,0,1,11.4,11.4L91.3,128l74.4,74.3a8.1,8.1,0,0,1,0,11.4A8.5,8.5,0,0,1,160,216Z"/>
                    </svg>
                </button>
            )}
            { hideNavigationButtons === false && (
                <button
                    aria-label="Next slide"
                    type="button"
                    onClick={() => navigate(NavigationDirection.NEXT)}
                    ref={arrowNextRef}
                    aria-hidden={nextArrowVisible === false}
                    className={classNames([
                        'slider__button',
                        'slider__button--next',
                        { 'slider__button--hidden': nextArrowVisible === false },
                    ])}
                >
                    <svg fill="#554c44" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
                        <path d="M96,216a8.5,8.5,0,0,1-5.7-2.3,8.1,8.1,0,0,1,0-11.4L164.7,128,90.3,53.7a8.1,8.1,0,0,1,11.4-11.4l80,80a8.1,8.1,0,0,1,0,11.4l-80,80A8.5,8.5,0,0,1,96,216Z"/>
                    </svg>
                </button>
            )}
        </div>
    );
};
