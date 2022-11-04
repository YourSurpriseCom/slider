import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from './Slider';

const renderSliderWithDimensions = (clientWidth = 1000, scrollWidth = 2000, scrollLeft = 0) => {
    render(<Slider>
        <span key={ 1 }/>
        <span key={ 2 }/>
        <span key={ 3 }/>
        <span key={ 4 }/>
    </Slider>);

    const wrapper = screen.getByRole('list');

    Object.defineProperty(wrapper, 'clientWidth', { value: clientWidth });
    Object.defineProperty(wrapper, 'scrollWidth', { value: scrollWidth });
    Object.defineProperty(wrapper, 'scrollLeft', { value: scrollLeft });
};

describe('Slider', () => {
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

    it('disconnects the intersection observer on re-render', () => {
        const element = <Slider><span>sup</span></Slider>;

        const { rerender } = render(element);

        rerender(element);

        expect(observeSpy).toHaveBeenCalledTimes(1);
    });

    it('sets controls visibility initially', () => {
        render(<Slider>
            <span key={ 1 } data-testid="child-1"/>
            <span key={ 2 } data-testid="child-2"/>
        </Slider>);

        const nextButton = screen.getByLabelText('Next slide');
        const prevButton = screen.getByLabelText('Previous slide');
        const lessContentFade = screen.getByTestId('less-content');
        const moreContentFade = screen.getByTestId('more-content');

        expect(prevButton.ariaHidden).toBe('false');
        expect(nextButton.ariaHidden).toBe('false');

        expect(lessContentFade.ariaHidden).toBe('false');
        expect(moreContentFade.ariaHidden).toBe('false');
    });

    it('allows scrolling by dragging with the mouse', () => {
        render(<Slider>
            <span key={1}/>
            <span key={2}/>
            <span key={3}/>
            <span key={4}/>
        </Slider>);

        const scrollElement = screen.getByRole('list');

        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.mouseDown(scrollElement);
        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.mouseMove(scrollElement, { clientX: 100, clientY: 0 });
        // eslint-disable-next-line testing-library/prefer-user-event
        fireEvent.mouseUp(scrollElement);

        expect(scrollElement.scrollLeft).toBe(-100);
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

            intersectionCallback([
                { intersectionRatio: 1, target: slides[0] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 0.5, target: slides[1] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 0, target: slides[2] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 0, target: slides[3] } as unknown as IntersectionObserverEntry,
            ]);

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

            intersectionCallback([
                { intersectionRatio: 0, target: slides[0] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 0, target: slides[1] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 1, target: slides[2] } as unknown as IntersectionObserverEntry,
                { intersectionRatio: 0.5, target: slides[3] } as unknown as IntersectionObserverEntry,
            ]);

            await userEvent.click(prevButton);

            expect(scrollToSpy).toHaveBeenCalledWith({
                behavior: 'smooth',
                left: -600,
                top: 0,
            });
        });

        it('updates controls visibility', () => {
            render(<Slider>
                <span key={1}/>
                <span key={2}/>
                <span key={3}/>
                <span key={4}/>
            </Slider>);

            const slides = screen.getAllByRole('listitem');
            const nextButton = screen.getByLabelText('Next slide');
            const prevButton = screen.getByLabelText('Previous slide');
            const lessContentFade = screen.getByTestId('less-content');
            const moreContentFade = screen.getByTestId('more-content');

            ([
                // All slides are visible
                [[1, 1, 1, 1], true, true, true, true],
                // No slides are visible
                [[0, 0, 0, 0], false, false, false, false],
                // Only the first slide is not visible
                [[0, 1, 1, 1], false, true, false, true],
                // Only the last slide is not visible
                [[1, 1, 1, 0], true, false, true, false],
            ] as Array<[number[], boolean, boolean, boolean, boolean]>).forEach((expectations) => {
                const [intersections, prevButtonHidden, nextButtonHidden, lessContentFadeHidden, moreContentFadeHidden] = expectations;

                intersectionCallback([
                    { intersectionRatio: intersections[0], target: slides[0] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: intersections[1], target: slides[1] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: intersections[2], target: slides[2] } as unknown as IntersectionObserverEntry,
                    { intersectionRatio: intersections[3], target: slides[3] } as unknown as IntersectionObserverEntry,
                ]);

                expect(prevButton.ariaHidden).toBe(String(prevButtonHidden));
                expect(nextButton.ariaHidden).toBe(String(nextButtonHidden));
                expect(lessContentFade.ariaHidden).toBe(String(lessContentFadeHidden));
                expect(moreContentFade.ariaHidden).toBe(String(moreContentFadeHidden));
            });
        });
    });
});
