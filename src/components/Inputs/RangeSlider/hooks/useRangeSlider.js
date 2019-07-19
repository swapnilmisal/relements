import React, { useState, useEffect } from 'react';
import { KEY_CODES } from 'constants';
import styles from './useRangeSlider.scss';

export function useRangeSlider({
  value, start, end, onChange, step, trackRef, single, onDrag, placeholder,
}) {
  const [startPosition, setStartPosition] = useState({});
  const [endPosition, setEndPosition] = useState({});
  const [pointerX, setPointerX] = useState();
  const [input, setInput] = useState('');
  const [dragging, setDragging] = useState();

  const translateToPosition = (knobValue) => {
    const value = start + (knobValue / 100) * (end - start);
    return Math.ceil(value / step) * step;
  };

  const translateFromPosition = (position) => {
    return (100 * (position - start)) / (end - start);
  };

  const startDragging = () => () => setDragging(true);

  const handleDrag = knobType => (e) => {
    const { pageX } = e;
    const trackRect = trackRef.current.getBoundingClientRect();

    if (pageX <= 0) return;

    let knobPosition = ((pageX - trackRect.left) / trackRect.width) * 100;
    knobPosition = knobPosition < 0 ? 0 : knobPosition;
    knobPosition = knobPosition > 100 ? 100 : knobPosition;

    // const knobPositionRounded = Math.ceil(knobPosition / this.props.step) * this.props.step;
    const knobPositionRounded = knobPosition;

    if (knobType === 'start' && knobPosition > endPosition.exact - 1) {
      setPointerX(pageX);
      setStartPosition({ exact: knobPosition, rounded: knobPositionRounded });
      setEndPosition({ exact: knobPosition + 1, rounded: knobPositionRounded + 1 });
    } else if (knobType === 'end' && knobPosition < startPosition.exact + 1) {
      setPointerX(pageX);
      setStartPosition({ exact: knobPosition - 1, rounded: knobPositionRounded - 1 });
      setEndPosition({ exact: knobPosition, rounded: knobPositionRounded });
    } else {
      setPointerX(pageX);
      const setter = knobType === 'start' ? setStartPosition : setEndPosition;
      setPointerX(pageX);
      setter({ exact: knobPosition, rounded: knobPositionRounded });
    }

    if (onDrag) {
      onDrag(translateToPosition(knobType, knobPosition));
    }
  };

  const endDrag = knobType => () => {
    const startValue = translateToPosition(startPosition.exact);
    const endValue = translateToPosition(endPosition.exact);

    if (single) onChange(endValue);
    else onChange([startValue, endValue]);

    const setter = knobType === 'start' ? setStartPosition : setEndPosition;
    const currentPosition = knobType === 'start' ? startPosition : endPosition;
    setPointerX(0);
    setDragging(false);
    setter({ exact: currentPosition.rounded, rounded: currentPosition.rounded });
  };

  const handleKeyDown = knobType => (e) => {
    const setter = knobType === 'start' ? setStartPosition : setEndPosition;
    let knobPosition = translateFromPosition(e.target.value);
    switch (e.keyCode) {
      case KEY_CODES.ENTER:
        e.preventDefault();
        if (knobPosition < 0) knobPosition = 0;
        if (knobPosition > 100) knobPosition = 100;
        setter({ exact: knobPosition, rounded: knobPosition });
        endDrag(knobType);
        break;
      default:
    }
  };

  const renderKnob = (knobType) => {
    const knobPosition = knobType === 'start' ? startPosition.exact : endPosition.exact;
    return (
      <div style={{ left: `${knobPosition}%` }} className={styles.sliderKnobWrapper}>
        <div
          style={{ left: pointerX }}
          draggable
          onDragStart={startDragging(knobType)}
          onDrag={handleDrag(knobType)}
          onDragEnd={endDrag(knobType)}
          className={styles.sliderKnobGhost}
        />
        <div className={styles.sliderKnob} />
      </div>
    );
  };

  const renderInput = (knobType) => {
    const knobPositionRounded = knobType === 'start' ? startPosition.rounded : endPosition.rounded;
    const value = input || (!knobPositionRounded && knobPositionRounded !== 0) ? input : translateToPosition(knobPositionRounded);
    return (
      <div className={styles.sliderTextInput}>
        <div className={styles.sliderTextInputLabel}>{knobType}</div>
        <input
          type="text"
          placeholder={placeholder || 'enter...'}
          value={value}
          onKeyDown={handleKeyDown(knobType)}
          onChange={(e) => {
            setInput({ input: e.target.value });
          }}
        />
      </div>
    );
  };

  const setPositions = (start = 0, end) => {
    const knobPositionStart = translateFromPosition(start);
    const knobPositionEnd = translateFromPosition(end);
    setStartPosition({ exact: knobPositionStart, rounded: knobPositionStart });
    setEndPosition({ exact: knobPositionEnd, rounded: knobPositionEnd });
  };

  useEffect(() => {
    single ? setPositions(0, value) : setPositions(value[0], value[1]);
  }, [value, value && value[0], value && value[1]]);

  const trackWidth = endPosition.exact - startPosition.exact;

  return {
    dragging,
    trackWidth,
    trackOffset: startPosition.exact,
    renderKnob,
    renderInput,
  };
}