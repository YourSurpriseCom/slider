import React from 'react';
import { createRoot } from 'react-dom/client';
import OnSlide from './examples/OnSlide';
import FixedWidth from './examples/FixedWidth';
import VaryingWidth from './examples/VaryingWidth';
import InitialSlide from './examples/InitialSlide';
import LazyLoaded from './examples/LazyLoaded';
import ScrollToSlide from './examples/ScrollToSlide';
import HideNavigation from './examples/HideNavigation';
import './Index.scss';

const Index: React.FC = () => (
    <div className="container">
        <h1>YourSurprise Slider</h1>
        <a href="https://github.com/YourSurpriseCom/slider">GitHub</a>
        <section>
            <h1>Dimensions</h1>
            <FixedWidth/>
            <VaryingWidth/>
        </section>
        <section>
            <h1>Images</h1>
            <LazyLoaded/>
        </section>
        <section>
            <h1>Configuration</h1>
            <HideNavigation/>
        </section>
        <section>
            <h1>API</h1>
            <InitialSlide/>
            <ScrollToSlide/>
            <OnSlide/>
        </section>
    </div>
);


(createRoot(document.getElementById('demo')!)).render(<Index/>);
