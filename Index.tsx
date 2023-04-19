import React, { useRef, useState } from 'react';
import { Slider } from './src/index';
import { createRoot } from 'react-dom/client';
import './Index.scss';
import { SliderTypes } from "./src/Slider";
import API = SliderTypes.API;

const Index: React.FC = () => {
    const [hideNavigationButtons, setHideNavigationButtons] = useState<boolean>(false);
    const sliderRefObject = useRef<API>(null);

    return (
        <div className="container">
            <h1>Configuration</h1>
            <button onClick={() => setHideNavigationButtons(!hideNavigationButtons)}>Toggle controls</button>
            <h1>Slides with fixed width</h1>
            <Slider hideNavigationButtons={hideNavigationButtons}>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(125, 125, 125)' }}>Slide 4</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(150, 150, 150)' }}>Slide 5</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(175, 175, 175)' }}>Slide 6</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(200, 200, 200)' }}>Slide 7</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(225, 225, 225)' }}>Slide 8</div>
            </Slider>
            <h1>Slides with fixed varying width</h1>
            <Slider hideNavigationButtons={hideNavigationButtons}>
                <div className="demo-slide" style={{ width: '100px', height: '200px', backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
                <div className="demo-slide" style={{ width: '200px', height: '200px', backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
                <div className="demo-slide" style={{ width: '300px', height: '200px', backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
                <div className="demo-slide" style={{ width: '400px', height: '200px', backgroundColor: 'rgb(125, 125, 125)' }}>Slide 4</div>
                <div className="demo-slide" style={{ width: '300px', height: '200px', backgroundColor: 'rgb(150, 150, 150)' }}>Slide 5</div>
                <div className="demo-slide" style={{ width: '200px', height: '200px', backgroundColor: 'rgb(175, 175, 175)' }}>Slide 6</div>
                <div className="demo-slide" style={{ width: '100px', height: '200px', backgroundColor: 'rgb(200, 200, 200)' }}>Slide 7</div>
                <div className="demo-slide" style={{ width: '75px', height: '200px', backgroundColor: 'rgb(225, 225, 225)' }}>Slide 8</div>
            </Slider>
            <h1>Slides with fixed varying width, initial on index 3 (slide 4)</h1>
            <Slider hideNavigationButtons={hideNavigationButtons} initialSlideIndex={3}>
                <div className="demo-slide" style={{ width: '100px', height: '200px', backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
                <div className="demo-slide" style={{ width: '200px', height: '200px', backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
                <div className="demo-slide" style={{ width: '300px', height: '200px', backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
                <div className="demo-slide" style={{ width: '400px', height: '200px', backgroundColor: 'rgb(125, 125, 125)' }}>Slide 4</div>
                <div className="demo-slide" style={{ width: '300px', height: '200px', backgroundColor: 'rgb(150, 150, 150)' }}>Slide 5</div>
                <div className="demo-slide" style={{ width: '200px', height: '200px', backgroundColor: 'rgb(175, 175, 175)' }}>Slide 6</div>
                <div className="demo-slide" style={{ width: '100px', height: '200px', backgroundColor: 'rgb(200, 200, 200)' }}>Slide 7</div>
                <div className="demo-slide" style={{ width: '75px', height: '200px', backgroundColor: 'rgb(225, 225, 225)' }}>Slide 8</div>
            </Slider>
            <h1>Slides with ScrollToSlide button</h1>
            <button onClick={() => sliderRefObject.current !== null && sliderRefObject.current.scrollToSlide(2, true)}>Scroll to slideIndex 2 (Slide 3)</button>
            <Slider hideNavigationButtons={hideNavigationButtons} ref={sliderRefObject}>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(50, 50, 50)' }}>Slide 1</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(75, 75, 75)' }}>Slide 2</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(100, 100, 100)' }}>Slide 3</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(125, 125, 125)' }}>Slide 4</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(150, 150, 150)' }}>Slide 5</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(175, 175, 175)' }}>Slide 6</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(200, 200, 200)' }}>Slide 7</div>
                <div className="demo-slide demo-slide--fixed" style={{ backgroundColor: 'rgb(225, 225, 225)' }}>Slide 8</div>
            </Slider>
            <h1>Slides with (lazy loaded) images</h1>
            <Slider hideNavigationButtons={hideNavigationButtons}>
                <img draggable={false} loading="lazy" className="demo-slide" width="100" height="200" alt="Slide 1" src="https://via.placeholder.com/100x200/333333"/>
                <img draggable={false} loading="lazy" className="demo-slide" width="200" height="200" alt="Slide 2" src="https://via.placeholder.com/200x200/333333"/>
                <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 3" src="https://via.placeholder.com/300x200/333333"/>
                <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 4" src="https://via.placeholder.com/300x200/333333"/>
                <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 5" src="https://via.placeholder.com/300x200/333333"/>
                <img draggable={false} loading="lazy" className="demo-slide" width="300" height="200" alt="Slide 6" src="https://via.placeholder.com/300x200/333333"/>
            </Slider>
        </div>
    );
};

(createRoot(document.getElementById('demo')!)).render(<Index/>);
