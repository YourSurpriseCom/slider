import type { SliderTypes } from '../src';
import { Slider } from '../src';
import type { ComponentType, FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import classnames from 'classnames';

const initialData = [
    { id: 0, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-252620-v2.png' },
    { id: 1, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-242699-v2.png' },
    { id: 2, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-199627-105979-v5.png' },
    { id: 3, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-137778-80541-v5.png' },
    { id: 4, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-252626-v3.png' },
    { id: 5, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-252632-v4.png' },
    { id: 6, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-252638-v2.png' },
    { id: 7, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-252665-v2.png' },
    { id: 8, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-269300-v6.png' },
    { id: 9, name: 'https://storage.googleapis.com/ysp-development-static-assets/thumbs/glasses/without-product-img/glass-0-4441-318783-v2.png' },
];


const InfiniteSliding: FC<typeof Slider extends ComponentType<infer T> ? Omit<T, 'children'> : never> = (sliderProps) => {
    const sliderApi = useRef<SliderTypes.API>(null);
    const [, setFirstVisibleSlideIndex] = useState<number>(0);
    const [, setLastVisibleSlideIndex] = useState<number>(0);
    const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
    const [data] = useState([...initialData, ...initialData]); // in order to be able to slide from the right, there should be slides to slide into at first. This is also related to the initial slide index too
    const [previousScrollLeft, setPreviousScrollLeft] = useState(0);
    const [newIndexTobeInsertedOnFront, setNewIndexTobeInsertedOnFront] = useState(initialData.length - 1);
    const [newIndexTobeInsertedOnBack, setNewIndexTobeInsertedOnBack] = useState(0);
    const [scrolling, setScrolling] = useState(false);


    const initializeValues = useCallback(() => {
        if (!sliderApi?.current) {
            return;
        }
        setFirstVisibleSlideIndex(sliderApi.current.getFirstFullyVisibleSlideIndex());
        setLastVisibleSlideIndex(sliderApi.current.getLastFullyVisibleSlideIndex());
        setActiveSlideIndex(Math.ceil((sliderApi.current.getLastFullyVisibleSlideIndex() + sliderApi.current.getFirstFullyVisibleSlideIndex()) / 2));

    }, []);

    // Inserts a specified number of slides at the end of the data.
    // Example: If initialData is [1, 2, 3, 4] and we want to insert 2 slides at the end, the result is [1, 2, 3, 4, 1, 2].

    const insertSlidesAtTheEnd = useCallback((numberOfSlidesToBeInserted : number) => {
        let index = newIndexTobeInsertedOnBack;
        for (let i = 0; i < numberOfSlidesToBeInserted; i++ ) {
            if (index === initialData.length - 1) {
                index = 0;
            }
            data.push(initialData[index]);
            index ++;
        }
        setNewIndexTobeInsertedOnBack(index);

    }, [data, newIndexTobeInsertedOnBack]);

    // Inserts a specified number of slides at the beginning of the data.
    // Example: If initialData is [1, 2, 3, 4] and we want to insert 2 slides at the beginning, the result is [3, 4, 1, 2, 3, 4].

    const insertSlidesAtTheBeginning = useCallback((numberOfSlidesToBeInserted : number) => {
        let index = newIndexTobeInsertedOnFront;
        for (let i = 0; i < numberOfSlidesToBeInserted; i++ ) {
            if (index === -1) {
                index = initialData.length - 1;
            }
            data.unshift(initialData[index]);
            index --;
        }
        setNewIndexTobeInsertedOnFront(index);

    }, [data, newIndexTobeInsertedOnFront]);

    const onScroll = () => {
        initializeValues();

        if (!sliderApi.current?.wrapperRef?.current) {
            return;
        }

        const wrapper = sliderApi.current.wrapperRef.current;
        const visibleElements = sliderApi.current.getLastFullyVisibleSlideIndex() - sliderApi.current.getFirstFullyVisibleSlideIndex();

        if (previousScrollLeft < wrapper.scrollLeft && sliderApi.current.getLastFullyVisibleSlideIndex() >= data.length - visibleElements) {
            if (!scrolling) {
                insertSlidesAtTheEnd(visibleElements);
                setScrolling(true);
            }
        } else if (previousScrollLeft > wrapper.scrollLeft && sliderApi.current.getFirstFullyVisibleSlideIndex() <= visibleElements) {
            if (!scrolling) {
                insertSlidesAtTheBeginning(visibleElements);
                setScrolling(true);
            }
            sliderApi.current.scrollToSlide(activeSlideIndex + visibleElements, 'instant', true);
        } else {
            setScrolling(false);
        }

        setPreviousScrollLeft(wrapper.scrollLeft);
    };

    const onActiveSlideClick = useCallback((clickedSlideIndex : number) => {

        if (!sliderApi.current) {
            return;
        }

        initializeValues();
        const step = clickedSlideIndex - activeSlideIndex;

        if (step < 0) {
            insertSlidesAtTheBeginning(-step);
            sliderApi.current.scrollToSlide(clickedSlideIndex - step, 'instant', true);
            setActiveSlideIndex(clickedSlideIndex - step);
        } else if (step > 0) {
            insertSlidesAtTheEnd(step);
            sliderApi.current.scrollToSlide(clickedSlideIndex, 'instant', true);
            setActiveSlideIndex(clickedSlideIndex);
        }

    }, [activeSlideIndex, initializeValues, insertSlidesAtTheBeginning, insertSlidesAtTheEnd]);

    return (
        <div className='slider'>
            <Slider {...sliderProps} ref={sliderApi} hideNavigationButtons={true} onSlide={onScroll} initialSlideIndex={initialData.length}>
                {data.map((item, index) => (
                    <div key={index} onClick={() => onActiveSlideClick(index)} className={classnames('demo-slide', index === activeSlideIndex ? 'active-slide' : '')}>
                        <img draggable={false} loading="lazy" src={item.name} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default InfiniteSliding;
