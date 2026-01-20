import classNames from 'classnames';
import type React from 'react';
import { Orientation } from '../../Slider';
import './Button.scss';

interface Props {
    onClick: () => void;
    isHidden: boolean;
    direction: `${Orientation}`;
}

export const PreviousButton: React.FC<Props> = ({ onClick, isHidden, direction }) => {
    return (
        <button
            aria-label="Previous slide"
            type="button"
            onClick={onClick}
            aria-hidden={isHidden}
            className={classNames([
                'slider__button',
                'slider__button__prev',
                {
                    'slider__button--hidden': isHidden,
                    'slider__button__prev--horizontal': direction === Orientation.HORIZONTAL,
                    'slider__button__prev--vertical': direction === Orientation.VERTICAL,
                },
            ])}
        >
            {/** biome-ignore lint/a11y/noSvgWithoutTitle: The button itself already has a label */}
            <svg className="slider__button__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256">
                <path d="M160,216a8.5,8.5,0,0,1-5.7-2.3l-80-80a8.1,8.1,0,0,1,0-11.4l80-80a8.1,8.1,0,0,1,11.4,11.4L91.3,128l74.4,74.3a8.1,8.1,0,0,1,0,11.4A8.5,8.5,0,0,1,160,216Z"/>
            </svg>
        </button>
    );
};
