import type { ComponentType, FC } from 'react';
import { Slider } from '../src';

const SingleSlideHorizontal: FC<typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never> = (sliderProps) =>  (
    <>
        <h3>Single slide (horizontal)</h3>
        <div className="single-slide">
            <Slider {...sliderProps} singleSlideView>
                <div className="demo-slide demo-slide--no-margin" style={{ width: '100%', height: '100%', backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
                <div className="demo-slide demo-slide--no-margin" style={{ width: '100%', height: '100%', backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
                <div className="demo-slide demo-slide--no-margin" style={{ width: '100%', height: '100%', backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
            </Slider>
        </div>
    </>
);

export default SingleSlideHorizontal;
