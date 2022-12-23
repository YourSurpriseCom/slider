# React slider

This package contains a basic modern slider. The purpose of this slider is to provide a simple React component
which can be controlled in a userfriendly way on mobile, tablet and desktop. 

This slider has the following features: 

- Free scroll on mobile with native CSS scroll snapping
- Drag to scroll on devices with a mouse
- Buttons to navigate on devices with a mouse
- Support for multiple variable width slides

Before using this slider, please consider the following:
- The slider only contains styling to make it functional
- There is no configuration of aforementioned features (yet)

All browsers with [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) are supported.

## Installation

### npm

`npm install @yoursurprisecom/slider --save`

### yarn

`yarn add @yoursurprisecom/slider`

### Import the CSS files

`import "@yoursurprise/slider/dist/index.css";`

### Implement the Slider

```
import { Slider } from '@yoursurprisecom/slider';
import '@yoursurprisecom/slider/dist/index.css';

export default function YourComponent() {
    return (
        <Slider>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
        </Slider>
    );
}
```




