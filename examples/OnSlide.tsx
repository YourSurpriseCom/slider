import type {FC, ComponentType, ReactElement} from 'react';
import { useRef, useState } from 'react';
import { Slider } from '../src';
import type { SliderTypes } from '../src';

const OnSlide: FC<typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never> = (sliderProps) => {
    const sliderApi = useRef<SliderTypes.API>(null);
    const [firstVisibleSlideIndex, setFirstVisibleSlideIndex] = useState<number>(0);
    const [lastVisibleSlideIndex, setLastVisibleSlideIndex] = useState<number>(0);

    const slides: ReactElement[] = [
        <div key="slide 1" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>,
        <div key="slide 2" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>,
        <div key="slide 3" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>,
        <div key="slide 4" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(125, 125, 125)' }}>Slide 4</div>,
        <div key="slide 5" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(150, 150, 150)' }}>Slide 5</div>,
        <div key="slide 6" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(175, 175, 175)' }}>Slide 6</div>,
        <div key="slide 7" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(200, 200, 200)' }}>Slide 7</div>,
        <div key="slide 8" className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(225, 225, 225)' }}>Slide 8</div>,
    ];

    const onSlide = () => {
        if (sliderApi.current) {
            setFirstVisibleSlideIndex(sliderApi.current.getFirstFullyVisibleSlideIndex());
            setLastVisibleSlideIndex(sliderApi.current.getLastFullyVisibleSlideIndex());
        }
    };

    return (
        <>
            <h3>Slides visibility</h3>
            <div>First fully visible slide: {firstVisibleSlideIndex + 1}</div>
            <div>Last fully visible slide: {lastVisibleSlideIndex + 1}</div>
            <br/>
            <Slider {...sliderProps} onSlide={onSlide} ref={sliderApi}>
                {slides}
            </Slider>
        </>
    );
};

export default OnSlide;
