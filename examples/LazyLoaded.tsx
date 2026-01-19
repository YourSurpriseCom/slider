import type { ComponentType, FC } from 'react';
import { Slider } from '../src';

const LazyLoaded: FC<typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never> = (sliderProps) => (
    <>
        <h3>Slides with (lazy loaded) images</h3>
        <p>Note: be sure to add 'draggable=false' to the img to prevent selecting and dragging the images</p>
        <Slider {...sliderProps}>
            <img draggable={false} loading="lazy" className="demo-slide" width="100" height="200" alt="Slide 1" src="https://via.placeholder.com/100x200/333333"/>
            <img draggable={false} loading="lazy" className="demo-slide" width="200" height="200" alt="Slide 2" src="https://via.placeholder.com/200x200/333333"/>
            <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 3" src="https://via.placeholder.com/300x200/333333"/>
            <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 4" src="https://via.placeholder.com/300x200/333333"/>
            <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 5" src="https://via.placeholder.com/300x200/333333"/>
            <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 6" src="https://via.placeholder.com/300x200/333333"/>
        </Slider>
    </>
);


export default LazyLoaded;
