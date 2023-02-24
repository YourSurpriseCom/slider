import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Slider } from './Slider';

const renderSliderWithDimensions = (clientWidth = 1000, scrollWidth = 2000, scrollLeft = 0) => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: clientWidth });
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, value: scrollLeft, writable: true });

    render(<Slider>
        <span key={1}/>
        <span key={2}/>
        <span key={3}/>
        <span key={4}/>
    </Slider>);
};

describe('UpsellSlider', () => {
    let observeSpy: jest.Mock;
    let disconnectSpy: jest.Mock;
    let scrollToSpy: jest.Mock;

    beforeEach(() => {
        const mockIntersectionObserver = jest.fn();
        observeSpy = jest.fn();
        disconnectSpy = jest.fn();
        scrollToSpy = jest.fn();

        mockIntersectionObserver.mockReturnValue({
            disconnect: disconnectSpy,
            observe: observeSpy,
            unobserve: () => jest.fn(),
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
            <span key={ 1 } data-testid="child-1"/>,
            <span key={ 2 } data-testid="child-2"/>,
            <span key={ 3 } data-testid="child-3"/>,
            <span key={ 4 } data-testid="child-4"/>,
        ];

        render(<Slider>{ children }</Slider>);
        expect(observeSpy).toHaveBeenCalledTimes(children.length);
    });

    it('sets the container scrollable if the scroll area exceeds the container width', () => {
        renderSliderWithDimensions(500, 1000);

        expect(screen.getByRole('list')).toHaveClass('is-scrollable');
    });

    it('does not set the container scrollable if the scroll area does not exceed the container width', () => {
        renderSliderWithDimensions(500, 400);

        expect(screen.getByRole('list')).not.toHaveClass('is-scrollable');
    });

    it('disconnects the intersection observer on re-render', () => {
        const element = <Slider><span>sup</span></Slider>;

        const { rerender } = render(element);

        rerender(element);

        expect(observeSpy).toHaveBeenCalledTimes(1);
    });

    describe('controls', () => {
        it('sets controls visibility initially', () => {
            renderSliderWithDimensions();

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
            renderSliderWithDimensions();

            const scrollElement = screen.getByRole('list');

            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseDown(scrollElement);
            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseMove(scrollElement, { clientX: 100, clientY: 0 });
            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseUp(scrollElement);

            expect(scrollElement.scrollLeft).toBe(-100);
        });

        it('registers click when not scrolling', async () => {
            const clickSpy = jest.fn();

            render(<Slider>
                <span data-testid="1" onClick={clickSpy}/>
            </Slider>);

            const scrollElement = screen.getByRole('list');

            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseDown(scrollElement);
            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseMove(scrollElement, { clientX: 100, clientY: 0 });
            // eslint-disable-next-line testing-library/prefer-user-event
            fireEvent.mouseUp(scrollElement);

            // This click is normally triggered when releasing the mouse after scrolling
            await userEvent.click(scrollElement);

            await userEvent.click(screen.getByTestId('1'));

            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe('sliding', () => {
        let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

        beforeEach(() => {
            const mockIntersectionObserver = jest.fn();
            intersectionCallback = jest.fn();

            mockIntersectionObserver.mockImplementation((callback: (entries: IntersectionObserverEntry[]) => void) => {
                intersectionCallback = callback;

                return ({
                    disconnect: jest.fn(),
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                });
            });

            global.IntersectionObserver = mockIntersectionObserver;
        });

        it('scrolls to the next slide', async () => {
            renderSliderWithDimensions();

            const slides = screen.getAllByRole('listitem');
            const nextButton = screen.getByLabelText('Next slide');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { value: 100 * (i + 1) });
                Object.defineProperty(child, 'offsetLeft', { value: 100 * (i + 1) });
            });

            await act(() => {
                intersectionCallback([
                    { intersectionRatio: 1, target: slides[ 0 ] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[ 1 ] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[ 2 ] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[ 3 ] } as unknown as IntersectionObserverEntry,
                ]);
            });

            await userEvent.click(nextButton);

            expect(scrollToSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                left: 200,
                top: 0,
            });
        });

        it('scrolls to the previous slide', async () => {
            renderSliderWithDimensions();

            const slides = screen.getAllByRole('listitem');
            const prevButton = screen.getByLabelText('Previous slide');

            slides.forEach((child, i) => {
                Object.defineProperty(child, 'clientWidth', { value: 100 * (i + 1) });
                Object.defineProperty(child, 'offsetLeft', { value: 100 * (i + 1) });
            });

            await act(() => {
                intersectionCallback([
                    { intersectionRatio: 0, target: slides[ 0 ] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0, target: slides[ 1 ] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 1, target: slides[ 2 ] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: 0.5, target: slides[ 3 ] } as unknown as IntersectionObserverEntry,
                ]);
            });

            await userEvent.click(prevButton);

            expect(scrollToSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                left: -600,
                top: 0,
            });
        });

        it('updates controls visibility', async () => {
            Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 1000 });
            Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, value: 0, writable: true });

            render(<Slider>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const slides = screen.getAllByRole('listitem');
            const nextButton = screen.getByLabelText('Next slide');
            const prevButton = screen.getByLabelText('Previous slide');

            const testCases = [
                // All slides are visible
                [[1, 1, 1, 1], true, true],
                // Only the first slide is not visible
                [[0, 1, 1, 1], false, true],
                // Only the last slide is not visible
                [[1, 1, 1, 0], true, false],
                // Only a single slide is partially visible
                [[0, 0, 0.5, 0], false, false],
            ] as Array<[number[], boolean, boolean]>;

            for (const testCase of testCases) {
                const [intersections, prevButtonHidden, nextButtonHidden] = testCase;

                // eslint-disable-next-line @typescript-eslint/no-loop-func
                await act(() => {
                    intersectionCallback([
                        { intersectionRatio: intersections[0], target: slides[0] } as unknown as IntersectionObserverEntry,
                        { intersectionRatio: intersections[1], target: slides[1] } as unknown as IntersectionObserverEntry,
                        { intersectionRatio: intersections[2], target: slides[2] } as unknown as IntersectionObserverEntry,
                        { intersectionRatio: intersections[3], target: slides[3] } as unknown as IntersectionObserverEntry,
                    ]);
                });

                expect(prevButton).toHaveAttribute('aria-hidden', String(prevButtonHidden));
                expect(nextButton).toHaveAttribute('aria-hidden', String(nextButtonHidden));
            }
        });
    });
});
