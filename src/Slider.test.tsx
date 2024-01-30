import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { SliderTypes } from './Slider';
import { Orientation, Slider } from './Slider';
import React, { ComponentType } from 'react';

type SliderOptions = typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never;

const renderSliderWithDimensions = ({
    clientWidth = 1000,
    scrollWidth = 2000,
    scrollLeft = 0,
    scrollTop = 0,
    scrollHeight = 2000,
    clientHeight = 1000,
}, sliderOptions: SliderOptions = {}) => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: scrollHeight });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: clientHeight });
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
        configurable: true,
        value: scrollLeft,
        writable: true,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
        configurable: true,
        value: scrollTop,
        writable: true,
    });

    render(<Slider {...sliderOptions}>
        <span key={1}/>
        <span key={2}/>
        <span key={3}/>
        <span key={4}/>
    </Slider>);
};

describe('Slider', () => {
    let mockIntersectionObserver: jest.Mock<IntersectionObserver, ConstructorParameters<typeof IntersectionObserver>>;
    let observeSpy: jest.Mock;
    let disconnectSpy: jest.Mock;
    let scrollToSpy: jest.Mock;

    const getIntersectionObserverInstance = () => mockIntersectionObserver.mock.calls[mockIntersectionObserver.mock.calls.length - 1];

    beforeEach(() => {
        observeSpy = jest.fn();
        disconnectSpy = jest.fn();
        scrollToSpy = jest.fn();

        mockIntersectionObserver = jest.fn().mockReturnValue({
            disconnect: disconnectSpy,
            observe: observeSpy,
            unobserve: () => jest.fn(),
            root: null,
            rootMargin: '',
            thresholds: [],
            takeRecords: jest.fn(),
        });
        global.IntersectionObserver = mockIntersectionObserver;
        Element.prototype.scrollTo = scrollToSpy;
    });

    afterEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 0 });
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 0 });
        Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, value: 0, writable: true });
    });

    it('renders children', () => {
        render(<Slider><span data-testid="child"/></Slider>);

        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('keeps track of the visibility of children', () => {
        const children = [
            <span key={1} data-testid="child-1"/>,
            <span key={2} data-testid="child-2"/>,
            <span key={3} data-testid="child-3"/>,
            <span key={4} data-testid="child-4"/>,
        ];

        render(<Slider>{children}</Slider>);
        expect(observeSpy).toHaveBeenCalledTimes(children.length);
    });

    it('does not set the container scrollable if the scroll area does not exceed the container width', () => {
        renderSliderWithDimensions({
            clientWidth: 200,
            scrollWidth: 200,
            clientHeight: 200,
            scrollHeight: 200,
        });

        expect(screen.getByRole('list')).not.toHaveClass('slider__wrapper--is-scrollable');
    });

    it('does not set the container scrollable if the scroll area does not exceed the container height', () => {
        renderSliderWithDimensions({
            clientWidth: 200,
            scrollWidth: 200,
            clientHeight: 200,
            scrollHeight: 200,
        }, {
            orientation: Orientation.VERTICAL,
        });


        expect(screen.getByRole('list')).not.toHaveClass('slider__wrapper--is-scrollable');
    });

    it('sets the container scrollable if the scroll area exceeds the container width', () => {
        renderSliderWithDimensions({
            clientWidth: 500,
            scrollWidth: 1000,
            clientHeight: 200,
            scrollHeight: 200,
        });

        expect(screen.getByRole('list')).toHaveClass('slider__wrapper--is-scrollable');
    });

    it('sets the container scrollable if the scroll area exceeds the container height', () => {
        renderSliderWithDimensions({
            clientWidth: 200,
            scrollWidth: 200,
            clientHeight: 500,
            scrollHeight: 1000,
        }, {
            orientation: Orientation.VERTICAL,
        });

        expect(screen.getByRole('list')).toHaveClass('slider__wrapper--is-scrollable');
    });

    it('disconnects the intersection observer on re-render', () => {
        const element = <Slider><span>sup</span></Slider>;

        const { rerender } = render(element);

        rerender(element);

        expect(observeSpy).toHaveBeenCalledTimes(1);
    });

    describe('controls', () => {
        it('does not render controls if both are hidden',  () => {
            renderSliderWithDimensions({});

            const nextButton = screen.queryByLabelText('Next slide');
            expect(nextButton).not.toBeInTheDocument();
        });

        it('sets controls visibility initially', () => {
            renderSliderWithDimensions({});

            const nextButton = screen.getByLabelText('Next slide');
            const prevButton = screen.getByLabelText('Previous slide');

            expect(prevButton).toHaveAttribute('aria-hidden', 'true');
            expect(nextButton).toHaveAttribute('aria-hidden', 'true');
        });

        it('does not render controls if disabled', () => {
            render(<Slider hideNavigationButtons={true}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const nextButton = screen.queryByLabelText('Next slide');
            const prevButton = screen.queryByLabelText('Previous slide');

            expect(prevButton).not.toBeInTheDocument();
            expect(nextButton).not.toBeInTheDocument();
        });

        it('allows scrolling by dragging with the mouse', () => {
            renderSliderWithDimensions({});

            const scrollElement = screen.getByRole('list');

            act(() => fireEvent.mouseDown(scrollElement));
            act(() => fireEvent.mouseMove(scrollElement, { clientX: 100, clientY: 0 }));
            act(() => fireEvent.mouseUp(scrollElement));

            expect(scrollElement.scrollLeft).toBe(-100);
            expect(scrollElement.scrollTop).toBe(0);
        });

        it('allows vertical scrolling by dragging with the mouse', () => {
            renderSliderWithDimensions({}, { orientation: Orientation.VERTICAL });

            const scrollElement = screen.getByRole('list');

            act(() => fireEvent.mouseDown(scrollElement));
            act(() => fireEvent.mouseMove(scrollElement, { clientX: 0, clientY: 100 }));
            act(() => fireEvent.mouseUp(scrollElement));

            expect(scrollElement.scrollTop).toBe(-100);
            expect(scrollElement.scrollLeft).toBe(0);
        });

        it('registers click when not scrolling', async () => {
            const clickSpy = jest.fn();

            render(<Slider>
                <span key={1} data-testid="1" onClick={clickSpy}/>
            </Slider>);

            const scrollElement = screen.getByRole('list');

            act(() => fireEvent.mouseDown(scrollElement));
            act(() => fireEvent.mouseMove(scrollElement, { clientX: 100, clientY: 0 }));
            act(() => fireEvent.mouseUp(scrollElement));

            await act(async () => {
                // This click is normally triggered when releasing the mouse after scrolling
                await userEvent.click(scrollElement);
                await userEvent.click(screen.getByTestId('1'));
            });

            await waitFor(() => {
                expect(clickSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('sliding', () => {
        it('scrolls to the next slide', async () => {
            renderSliderWithDimensions({});

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;

            const slides = screen.getAllByRole('listitem');
            const nextButton = screen.getByLabelText('Next slide');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { value: 100 * (i + 1) });
                Object.defineProperty(child, 'offsetLeft', { value: 100 * (i + 1) });
            });

            act(() => {
                intersectionCallback([
                    { intersectionRatio: 1, target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[3] } as unknown as IntersectionObserverEntry,
                ], mockIntersectionObserver.mock.instances[0]);
            });

            await userEvent.click(nextButton);

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    left: 200,
                });
            });
        });

        it('scrolls to the next slide vertically', async () => {
            renderSliderWithDimensions({}, { orientation: Orientation.VERTICAL });

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;

            const slides = screen.getAllByRole('listitem');
            const nextButton = screen.getByLabelText('Next slide');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientHeight', { value: 100 * (i + 1) });
                Object.defineProperty(child, 'offsetTop', { value: 100 * (i + 1) });
            });

            act(() => {
                intersectionCallback([
                    { intersectionRatio: 1, target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[3] } as unknown as IntersectionObserverEntry,
                ], mockIntersectionObserver.mock.instances[0]);
            });

            await userEvent.click(nextButton);

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    top: 200,
                });
            });
        });

        it('scrolls to the previous slide', async () => {
            renderSliderWithDimensions({});

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;

            const slides = screen.getAllByRole('listitem');
            const prevButton = screen.getByLabelText('Previous slide');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { value: 100 * (i + 1) });
                Object.defineProperty(child, 'offsetLeft', { value: 100 * (i + 1) });
            });

            act(() => {
                intersectionCallback([
                    { intersectionRatio: 0, target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 1, target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[3] } as unknown as IntersectionObserverEntry,
                ], mockIntersectionObserver.mock.instances[0]);
            });

            await userEvent.click(prevButton);

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    left: -600,
                });
            });
        });

        it('scrolls to the previous slide vertically', async () => {
            renderSliderWithDimensions({}, { orientation: Orientation.VERTICAL });

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;

            const slides = screen.getAllByRole('listitem');
            const prevButton = screen.getByLabelText('Previous slide');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientHeight', { value: 100 * (i + 1) });
                Object.defineProperty(child, 'offsetTop', { value: 100 * (i + 1) });
            });

            act(() => {
                intersectionCallback([
                    { intersectionRatio: 0, target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 1, target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[3] } as unknown as IntersectionObserverEntry,
                ], mockIntersectionObserver.mock.instances[0]);
            });

            await userEvent.click(prevButton);

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    top: -600,
                });
            });
        });

        it.each([
            ['all slides are visible', [1, 1, 1, 1], true, true],
            ['only the first slide is not visible', [0, 1, 1, 1], false, true],
            ['only the last slide is not visible', [1, 1, 1, 0], true, false],
            ['only a single slide is partially visible', [0, 0, 0.5, 0], false, false],
        ])('updates controls visibility when %s', (testCase, intersections, prevButtonHidden, nextButtonHidden) => {
            Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 1000 });
            Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
                configurable: true,
                value: 0,
                writable: true,
            });

            render(<Slider>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;

            const slides = screen.getAllByRole('listitem');
            const nextButton = screen.getByLabelText('Next slide');
            const prevButton = screen.getByLabelText('Previous slide');

            act(() => {
                intersectionCallback([
                    { intersectionRatio: intersections[0], target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: intersections[1], target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: intersections[2], target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: intersections[3], target: slides[3] } as unknown as IntersectionObserverEntry,
                ], mockIntersectionObserver.mock.instances[0]);
            });

            expect(prevButton).toHaveAttribute('aria-hidden', String(prevButtonHidden));
            expect(nextButton).toHaveAttribute('aria-hidden', String(nextButtonHidden));
        });
    });

    describe('scrollToSlide', () => {
        it('scrolls to a specific slide', async () => {
            const ref = React.createRef<SliderTypes.API>();
            render(<Slider ref={ref}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const slides = screen.getAllByRole('listitem');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { configurable: true, value: 500 });
                Object.defineProperty(child, 'offsetLeft', { value: 500 * (i + 1) });
            });

            act(() => {
                if (ref.current !== null) {
                    ref.current.scrollToSlide(2, 'smooth');
                }
            });

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    left: 1500,
                });
            });
        });

        it('scrolls to the previous slide programmatically', async () => {
            const ref = React.createRef<SliderTypes.API>();

            render(<Slider ref={ref}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;
            const slides = screen.getAllByRole('listitem');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { configurable: true, value: 500 });
                Object.defineProperty(child, 'offsetLeft', { value: 500 * (i + 1) });
            });

            act(() => {
                intersectionCallback([
                    { intersectionRatio: 0, target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 1, target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[3] } as unknown as IntersectionObserverEntry,
                ], mockIntersectionObserver.mock.instances[0]);
            });

            act(() => {
                if (ref.current !== null) {
                    ref.current.scrollToPreviousSlide();
                }
            });

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    left: 1500,
                });
            });
        });

        it('scrolls to the next slide programmatically', async () => {
            const ref = React.createRef<SliderTypes.API>();
            render(<Slider ref={ref}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const slides = screen.getAllByRole('listitem');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { configurable: true, value: 500 });
                Object.defineProperty(child, 'offsetLeft', { value: 500 * (i + 1) });
            });

            act(() => {
                if (ref.current !== null) {
                    ref.current.scrollToNextSlide();
                }
            });

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    left: 500,
                });
            });
        });

        it('scrolls to a specific slide', async () => {
            const ref = React.createRef<SliderTypes.API>();
            render(<Slider ref={ref}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const slides = screen.getAllByRole('listitem');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { configurable: true, value: 500 });
                Object.defineProperty(child, 'offsetLeft', { value: 500 * (i + 1) });
            });

            act(() => {
                if (ref.current !== null) {
                    ref.current.scrollToSlide(2, 'smooth');
                }
            });

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    left: 1500,
                });
            });
        });

        it('scrolls to a specific slide vertically', async () => {
            const ref = React.createRef<SliderTypes.API>();
            render(<Slider ref={ref} orientation={Orientation.VERTICAL}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const slides = screen.getAllByRole('listitem');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientHeight', { configurable: true, value: 500 });
                Object.defineProperty(child, 'offsetTop', { value: 500 * (i + 1) });
            });

            act(() => {
                if (ref.current !== null) {
                    ref.current.scrollToSlide(2, 'smooth');
                }
            });

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalledWith({
                    behavior: 'smooth',
                    top: 1500,
                });
            });
        });
    });


    describe('initialSlideIndex', () => {
        it('Opens the slider with the initialSlide', async () => {
            render(<Slider initialSlideIndex={2}>
                <span key={1} data-testid="child-1"/>
                <span key={2} data-testid="child-2"/>
                <span key={3} data-testid="child-3"/>
                <span key={4} data-testid="child-4"/>
            </Slider>);

            await waitFor(() => {
                expect(scrollToSpy).toHaveBeenCalled();
            });
        });
    });

    describe('onSlide', function () {
        it('calls the onSlide callback when an intersection occurs', () => {
            const onSlideSpy = jest.fn();
            render(<Slider onSlide={onSlideSpy}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;
            intersectionCallback([], mockIntersectionObserver.mock.instances[0]);

            expect(onSlideSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('visible slide indexes', () => {
        it('retrieves the first and last fully visible slide indices', () => {
            const ref = React.createRef<SliderTypes.API>();
            render(<Slider ref={ref}>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
                <span key={5}/>
            </Slider>);

            const intersectionObserverInstance = getIntersectionObserverInstance();
            const [intersectionCallback] = intersectionObserverInstance;

            const slides = screen.getAllByRole('listitem');

            intersectionCallback([
                { intersectionRatio: 1, target: slides[0] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 1, target: slides[1] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 1, target: slides[2] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: .5, target: slides[3] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 0, target: slides[4] } as unknown as IntersectionObserverEntry,
            ], mockIntersectionObserver.mock.instances[0]);

            expect(ref.current!.getFirstFullyVisibleSlideIndex()).toBe(0);
            expect(ref.current!.getLastFullyVisibleSlideIndex()).toBe(2);
        });
    });
});

