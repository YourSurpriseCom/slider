import classNames from 'classnames';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Children, forwardRef, PropsWithChildren, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { NextButton } from './Components/Controls/NextButton';
import { PreviousButton } from './Components/Controls/PreviousButton';
import { NavigationDirection, useSlider, Visibility } from './Hooks/UseSlider';
import './Slider.scss';

export namespace SliderTypes {
    export interface Settings {
        // Sets whether the navigation buttons (next/prev) are no longer rendered
        hideNavigationButtons?: boolean;
        initialSlideIndex?: number;
    }

    export interface API {
        scrollToSlide: (index: number, smooth: boolean) => void;
    }
}

interface SlideVisibilityEntry {
    element: HTMLDivElement;
    visibility: Visibility;
}

export const Slider = forwardRef<SliderTypes.API, PropsWithChildren<SliderTypes.Settings>>(({ children, hideNavigationButtons = false, initialSlideIndex = 0 }, ref) => {
    const slides = useRef<SlideVisibilityEntry[]>([]);
    const wrapper = useRef<HTMLDivElement | null>(null);

    const [nextArrowVisible, setNextArrowVisible] = useState<boolean>(false);
    const [prevArrowVisible, setPrevArrowVisible] = useState<boolean>(false);

    const [isScrollable, setIsScrollable] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isBlockingClicks, setIsBlockingClicks] = useState<boolean>(false);
    const [mousePosition, setMousePosition] = useState<{ clientX: number; scrollX: number }>({
        clientX: 0,
        scrollX: 0,
    });

    const {
        getLeftPositionToScrollTo,
        getVisibilityByIntersectionRatio,
        addVisibleSlide,
        addPartiallyVisibleSlide,
        getLastVisibleSlideIndex,
        sortSlides,
        getFirstVisibleSlideIndex,
        removeVisibleSlide,
        removePartiallyVisibleSlide,
    } = useSlider();

    const blockChildClickHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        if (isBlockingClicks) {
            event.stopPropagation();
            event.preventDefault();
        }

        setIsBlockingClicks(false);
    };

    const mouseUpHandler = () => setIsDragging(false);

    const mouseDownHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        setMousePosition({
            ...mousePosition,
            clientX: event.clientX,
            scrollX: wrapper.current?.scrollLeft ?? 0,
        });

        setIsDragging(true);
    };

    const mouseMoveHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper || !isDragging) {
            return;
        }

        if (Math.abs(mousePosition.clientX - event.clientX) > 5) {
            setIsBlockingClicks(true);
        }

        currentWrapper.scrollLeft = mousePosition.scrollX + mousePosition.clientX - event.clientX;
    };

    const addSlide = (node: HTMLDivElement, index: number) => {
        slides.current[index] = {
            element: node,
            visibility: Visibility.NONE,
        };
    };

    const scrollToSlide = (index: number, smooth: boolean) => {
        const targetSlide = slides.current[index];
        const currentWrapper = wrapper.current;

        if (!targetSlide || !currentWrapper) {
            return;
        }

        let direction = NavigationDirection.NEXT;

        if (getFirstVisibleSlideIndex() > index) {
            direction = NavigationDirection.PREV;
        }

        const scrollLeft = getLeftPositionToScrollTo(
            direction,
            targetSlide.element.offsetLeft,
            currentWrapper.offsetLeft,
            currentWrapper.clientWidth,
            targetSlide.element.clientWidth,
        );

        currentWrapper.scrollTo({ behavior: smooth ? 'smooth' : 'auto', left: scrollLeft, top: 0 });
    };

    const navigate = (direction: NavigationDirection) => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper) {
            return;
        }

        const targetSlideIndex = direction === NavigationDirection.PREV ? getFirstVisibleSlideIndex() - 1 : getLastVisibleSlideIndex() + 1;
        scrollToSlide(targetSlideIndex, true);
    };

    const setControlsVisibility = useCallback(() => {
        const lastSlideFullyVisible = getLastVisibleSlideIndex() + 1 === slides.current.length;

        setPrevArrowVisible(getFirstVisibleSlideIndex() > 0 && isScrollable);
        setNextArrowVisible(isScrollable && !lastSlideFullyVisible);
    }, [getFirstVisibleSlideIndex, getLastVisibleSlideIndex, isScrollable]);

    useEffect(() => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper) {
            return () => {};
        }

        const checkScrollable = () => setIsScrollable(currentWrapper.scrollWidth > currentWrapper.clientWidth);

        const scrollToInitialSlide = () => {
            if (initialSlideIndex !== 0) {
                const targetSlide = slides.current[initialSlideIndex];

                if (!targetSlide || !currentWrapper) {
                    return;
                }

                const scrollLeft = targetSlide.element.offsetLeft - currentWrapper.offsetLeft;

                currentWrapper.scrollTo({ behavior: 'instant', left: scrollLeft, top: 0 });
            }
        };

        window?.addEventListener('resize', checkScrollable);

        checkScrollable();
        scrollToInitialSlide();

        return () => {
            window?.removeEventListener('resize', checkScrollable);
        };
    }, [wrapper, initialSlideIndex]);

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

    useEffect(() => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper) {
            return () => {};
        }

        const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                const target = entry.target as HTMLDivElement;
                const index = Number(target.dataset.slideIndex);
                const visibility = getVisibilityByIntersectionRatio(entry.intersectionRatio);

                visibility === Visibility.FULL ? addVisibleSlide(index) : removeVisibleSlide(index);
                visibility === Visibility.PARTIAL ? addPartiallyVisibleSlide(index) : removePartiallyVisibleSlide(index);
            });

            sortSlides();

            if (!hideNavigationButtons) {
                setControlsVisibility();
            }
        };

        const intersectionObserver = new IntersectionObserver(intersectionCallback, {
            root: currentWrapper,
            threshold: [0, 0.5, 0.9],
        });

        slides.current.forEach(({ element }) => intersectionObserver.observe(element));

        return () => intersectionObserver.disconnect();
    }, [
        wrapper,
        setControlsVisibility,
        hideNavigationButtons,
        sortSlides,
        addVisibleSlide,
        removeVisibleSlide,
        addPartiallyVisibleSlide,
        removePartiallyVisibleSlide,
        getVisibilityByIntersectionRatio,
    ]);

    useImperativeHandle(ref, () => ({
        scrollToSlide: scrollToSlide,
    }));

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
            { !hideNavigationButtons && (
                <>
                    <PreviousButton onClick={() => navigate(NavigationDirection.PREV)} isHidden={!prevArrowVisible}/>
                    <NextButton onClick={() => navigate(NavigationDirection.NEXT)} isHidden={!nextArrowVisible}/>
                </>
            )}
        </div>
    );
});
