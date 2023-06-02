import type { FC, ComponentType } from 'react';
import React from 'react';
import { Slider } from '../src';

const VaryingWidth: FC<typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never> = (sliderProps) => (
    <>
        <h3>Slides with fixed varying width</h3>
        <Slider {...sliderProps}>
            <div className="demo-slide" style={{ width: '100px', height: '200px', backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
            <div className="demo-slide" style={{ width: '200px', height: '200px', backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
            <div className="demo-slide" style={{ width: '300px', height: '200px', backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
            <div className="demo-slide" style={{ width: '400px', height: '200px', backgroundColor: 'rgb(125, 125, 125)' }}>Slide 4</div>
            <div className="demo-slide" style={{ width: '300px', height: '200px', backgroundColor: 'rgb(150, 150, 150)' }}>Slide 5</div>
            <div className="demo-slide" style={{ width: '200px', height: '200px', backgroundColor: 'rgb(175, 175, 175)' }}>Slide 6</div>
            <div className="demo-slide" style={{ width: '100px', height: '200px', backgroundColor: 'rgb(200, 200, 200)' }}>Slide 7</div>
            <div className="demo-slide" style={{ width: '75px', height: '200px', backgroundColor: 'rgb(225, 225, 225)' }}>Slide 8</div>
        </Slider>
    </>
);

export default VaryingWidth;
