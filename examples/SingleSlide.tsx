import type { FC, ComponentType } from 'react';
import React from 'react';
import { Slider } from '../src';

const SingleSlide: FC<typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never> = (sliderProps) =>  (
    <>
        <h3>Slides with dynamic (percentual) width</h3>
        <div className="single-slide">
            <Slider {...sliderProps} >
                <div className="demo-slide demo-slide--no-margin" style={{ width: '100%', height: '100%', backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
                <div className="demo-slide demo-slide--no-margin" style={{ width: '100%', height: '100%', backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
                <div className="demo-slide demo-slide--no-margin" style={{ width: '100%', height: '100%', backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
            </Slider>
        </div>
    </>
);

export default SingleSlide;
