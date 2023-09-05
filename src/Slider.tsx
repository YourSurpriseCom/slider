import classNames from 'classnames';
import type { MouseEvent as ReactMouseEvent, Ref } from 'react';
import {
    Children,
    forwardRef,
    PropsWithChildren,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { NextButton } from './Components/Controls/NextButton';
import { PreviousButton } from './Components/Controls/PreviousButton';
import { NavigationDirection, useSlider, Visibility } from './Hooks/UseSlider';
import './Slider.scss';

export namespace SliderTypes {
    export interface API {
        scrollToSlide: (index: number, behaviour: ScrollBehavior) => void;
        scrollToNextSlide: () => void;
        scrollToPreviousSlide: () => void;
        getFirstFullyVisibleSlideIndex(): number;
        getLastFullyVisibleSlideIndex(): number;
        wrapperRef: Ref<HTMLDivElement>;
    }
}
export enum Orientation {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}
interface Settings {
    // Sets whether the navigation buttons (next/prev) are no longer rendered
    hideNavigationButtons?: boolean;
    initialSlideIndex?: number;
    onSlide?: () => void;
    orientation?: `${Orientation}`,
}

interface SlideVisibilityEntry {
    element: HTMLDivElement;
    visibility: Visibility;
}

export const Slider = forwardRef<SliderTypes.API, PropsWithChildren<Settings>>(({
    children,
    hideNavigationButtons = false,
    initialSlideIndex = 0,
    onSlide = () => null,
    orientation = Orientation.HORIZONTAL,
}, ref) => {
    const slides = useRef<SlideVisibilityEntry[]>([]);
    const wrapper = useRef<HTMLDivElement | null>(null);

    const [nextArrowVisible, setNextArrowVisible] = useState<boolean>(false);
    const [prevArrowVisible, setPrevArrowVisible] = useState<boolean>(false);

    const [isScrollable, setIsScrollable] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isBlockingClicks, setIsBlockingClicks] = useState<boolean>(false);

    const [mousePosition, setMousePosition] = useState<{
        clientX: number;
        clientY: number
        scrollX: number;
        scrollY: number;
    }>({
        clientX: 0,
        clientY: 0,
        scrollX: 0,
        scrollY: 0,
    });

    const {
        getPositionToScrollTo,
        getVisibilityByIntersectionRatio,
        addVisibleSlide,
        addPartiallyVisibleSlide,
        getLastVisibleSlideIndex,
        sortSlides,
        getFirstVisibleSlideIndex,
        removeVisibleSlide,
        removePartiallyVisibleSlide,
        shouldBlockClicks,
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
            clientY: event.clientY,
            scrollX: wrapper.current?.scrollLeft ?? 0,
            scrollY: wrapper.current?.scrollTop ?? 0,
        });

        setIsDragging(true);
    };

    const mouseMoveHandler = (event: ReactMouseEvent<HTMLDivElement>) => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper || !isDragging) {
            return;
        }

        switch (orientation) {
            case Orientation.HORIZONTAL:
                if (shouldBlockClicks(mousePosition.clientX - event.clientX)) {
                    setIsBlockingClicks(true);
                }

                currentWrapper.scrollLeft = mousePosition.scrollX + mousePosition.clientX - event.clientX;
                break;
            case Orientation.VERTICAL:
                if (shouldBlockClicks(mousePosition.clientY - event.clientY)) {
                    setIsBlockingClicks(true);
                }

                currentWrapper.scrollTop = mousePosition.scrollY + mousePosition.clientY - event.clientY;
                break;
        }
    };

    const addSlide = (node: HTMLDivElement, index: number) => {
        slides.current[index] = {
            element: node,
            visibility: Visibility.NONE,
        };
    };

    const scrollToSlide = (index: number, behavior: ScrollBehavior) => {
        const targetSlide = slides.current[index];
        const currentWrapper = wrapper.current;

        if (!targetSlide || !currentWrapper) {
            return;
        }

        const navDirection = (index >= getFirstVisibleSlideIndex()) ? NavigationDirection.NEXT : NavigationDirection.PREV;

        let scrollLeft = undefined;
        let scrollTop = undefined;

        switch (orientation) {
            case Orientation.HORIZONTAL:
                scrollLeft = getPositionToScrollTo(
                    navDirection,
                    targetSlide.element.offsetLeft,
                    currentWrapper.offsetLeft,
                    currentWrapper.clientWidth,
                    targetSlide.element.clientWidth,
                );
                break;
            case Orientation.VERTICAL:
                scrollTop = getPositionToScrollTo(
                    navDirection,
                    targetSlide.element.offsetTop,
                    currentWrapper.offsetTop,
                    currentWrapper.clientHeight,
                    targetSlide.element.clientHeight,
                );
                break;
        }

        const scrollOptions: Partial<ScrollToOptions> = {
            behavior,
            ...(Number.isInteger(scrollLeft) && { left: scrollLeft } ),
            ...(Number.isInteger(scrollTop) && { top: scrollTop } ),
        };


        currentWrapper.scrollTo(scrollOptions);
    };

    const navigate = (navDirection: NavigationDirection) => {
        const currentWrapper = wrapper.current;

        if (!currentWrapper) {
            return;
        }

        const targetSlideIndex = navDirection === NavigationDirection.PREV ? getFirstVisibleSlideIndex() - 1 : getLastVisibleSlideIndex() + 1;

        scrollToSlide(targetSlideIndex, 'smooth');
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

        const checkScrollable = () => setIsScrollable(orientation === Orientation.VERTICAL ? currentWrapper.scrollHeight > currentWrapper.clientHeight : currentWrapper.scrollWidth > currentWrapper.clientWidth);

        const scrollToInitialSlide = () => {
            if (initialSlideIndex !== 0) {
                const targetSlide = slides.current[initialSlideIndex];

                if (!targetSlide || !currentWrapper) {
                    return;
                }

                let scrollLeft = undefined;
                let scrollTop = undefined;

                switch (orientation) {
                    case Orientation.HORIZONTAL:
                        scrollLeft = targetSlide.element.offsetLeft - currentWrapper.offsetLeft;
                        break;
                    case Orientation.VERTICAL:
                        scrollTop = targetSlide.element.offsetTop - currentWrapper.offsetTop;
                        break;
                }

                const scrollOptions: Partial<ScrollToOptions> = {
                    behavior: 'instant',
                    ...(Number.isInteger(scrollLeft) && { left: scrollLeft } ),
                    ...(Number.isInteger(scrollTop) && { top: scrollTop } ),
                };

                currentWrapper.scrollTo(scrollOptions);
            }
        };

        window?.addEventListener('resize', checkScrollable);

        checkScrollable();
        scrollToInitialSlide();

        return () => {
            window?.removeEventListener('resize', checkScrollable);
        };
    }, [wrapper, initialSlideIndex, orientation]);

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

            onSlide();
        };

        const intersectionObserver = new IntersectionObserver(intersectionCallback, {
            root: currentWrapper,
            threshold: [0, 0.5, 0.9, 1],
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
        onSlide,
    ]);

    const scrollToNextSlide = () => navigate(NavigationDirection.NEXT);
    const scrollToPreviousSlide = () => navigate(NavigationDirection.PREV);

    useImperativeHandle(ref, () => ({
        scrollToSlide: scrollToSlide,
        scrollToNextSlide: scrollToNextSlide,
        scrollToPreviousSlide: scrollToPreviousSlide,
        getFirstFullyVisibleSlideIndex: getFirstVisibleSlideIndex,
        getLastFullyVisibleSlideIndex: getLastVisibleSlideIndex,
        wrapperRef: wrapper,
    }));

    return (
        <div className="slider">
            <div role="list" ref={wrapper}
                onMouseDown={mouseDownHandler}
                onMouseMove={mouseMoveHandler}
                onMouseUp={mouseUpHandler}
                onClickCapture={blockChildClickHandler}
                className={classNames('slider__wrapper', {
                    'slider__wrapper--is-scrollable': isScrollable,
                    'slider__wrapper--is-dragging': isDragging,
                    'slider__wrapper--is-horizontal': orientation === Orientation.HORIZONTAL,
                    'slider__wrapper--is-vertical': orientation === Orientation.VERTICAL,
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
                    <PreviousButton onClick={scrollToPreviousSlide} isHidden={!prevArrowVisible} direction={orientation}/>
                    <NextButton onClick={scrollToNextSlide} isHidden={!nextArrowVisible} direction={orientation}/>
                </>
            )}
        </div>
    );
});
