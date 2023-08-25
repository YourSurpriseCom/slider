# React slider
**Also known as: Swooper**

This package contains a basic modern slider (±2.5kb gzipped). The purpose of this slider is to provide a simple React component
which can be controlled in a userfriendly way on mobile, tablet and desktop. 

The aim is to keep the slider as basic as possible, while exposing an API that allows more advanced implementations to be realised. 

Demo page: https://yoursurprisecom.github.io/slider/

This slider has the following features:

- Free scroll on mobile with native CSS scroll snapping
- Drag to scroll on devices with a mouse
- Buttons to navigate on devices with a mouse
- Support for multiple variable width slides

Todos (help appreciated):

- Expand end-to-end test suite
- Improve accessibility
- Reduce amount of required tooling

All browsers with support for [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and [scroll-snap](https://caniuse.com/css-snappoints) are supported. 

## Installation

### npm

`npm install @yoursurprise/slider --save`

### yarn

`yarn add @yoursurprise/slider`

### Import the CSS files

```javascript
import "@yoursurprise/slider/dist/index.css";
```

### Implement the Slider

```javascript
import {Slider} from '@yoursurprise/slider';
import '@yoursurprise/slider/dist/index.css';

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

### Configuration

| Option                | Type       | Required | Default      | Description                                             |   
|-----------------------|------------|----------|--------------|---------------------------------------------------------|
| hideNavigationButtons | `boolean`  | `false`  | `false`      | Always hides the navigation buttons                     |
| initialSlideIndex     | `number`   | `false`  | `0`          | Open the Slider at a specific index                     |
| onSlide               | `function` | `false`  | `undefined`  | A callback function that is called when the user slides |
| direction             | `string`   | `false`  | `horizontal` | Direction of the slider: 'horizontal' or 'vertical'     |

### API

| API method                     | Type       | Returns  | Description                                  |   
|--------------------------------|------------|----------|----------------------------------------------|
| getFirstFullyVisibleSlideIndex | `function` | `number` | Retrieve the first fully visible slide index |
| getLastFullyVisibleSlideIndex  | `function` | `number` | Retrieve the last fully visible slide index  |
| scrollToSlide                  | `function` | `void`   | Scroll the slider to a specific slide        |

#### Example on how to access the slider API:

```javascript
export default function YourComponent() {
    const sliderApi = useRef();

    useEffect(() => {
        if (sliderApi.current) {
            sliderApi.current.getFirstFullyVisibleSlideIndex();
        }
    }, [sliderApi.current]);

    return (
        <Slider ref={sliderApi}>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
        </Slider>
    );
}
```

## Development

#### End-to-end tests

Prior to developing or running end-to-end tests, install the browsers in which the tests will run:

`npx playwright install`

Afterwards, the tests can be run using:

`npm run e2e-tests`

Or alternatively the test interface can be opened using:

`npm run e2e-tests-ui`


