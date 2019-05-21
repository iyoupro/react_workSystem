import React, { memo, useEffect, useRef, useState } from 'react';
import styles from './index.less';

const init = (initFunc) => {
  const isInit = useRef(false);
  useEffect(()=> {
    if (!isInit.current && initFunc) {
      initFunc();
      isInit.current = true;
    }
  });
}

const addRightClick = (target, menuContent) => {
  let progress = 0;
  let timer = null;
  const animationShow = () => {
    menuContent.style.opacity = `${progress}`;
    // menuContent.style.transform = `scale(${progress})`;
    progress += 0.05;
    if (progress <= 1) requestAnimationFrame(animationShow);
  }
  const animationHidden = () => {
    menuContent.style.opacity = `${progress}`;
    // menuContent.style.transform = `scale(${progress})`;
    progress -= 0.05;
    if (progress >= 0) requestAnimationFrame(animationHidden);
    else {
      clearInterval(timer);
      menuContent.style.display = `none`;
    }
  }

  const handleMouseOut = (event) => {
    menuContent.removeEventListener('mouseout', handleMouseOut);
    requestAnimationFrame(animationHidden);
  }

  target.oncontextmenu = (event) => {
    event.preventDefault();
    progress = 0;
    menuContent.style.left = `${event.pageX - 12}px`;
    menuContent.style.top = `${event.pageY - 12}px`;
    menuContent.style.display = `block`;
    console.log(menuContent.clientWidth);
    requestAnimationFrame(animationShow);
    let time = 0;
    timer = setInterval(() => {
      time++;
      if (time === 50) {
        clearInterval(timer);
        requestAnimationFrame(animationHidden);
      }
    }, 16.7);
    menuContent.addEventListener('mouseout', handleMouseOut);
  }
}

const RightClickMenu = props => {
  let wrapper = useRef(null);
  let contentWrapper = useRef(null);
  init(() => addRightClick(wrapper.current, contentWrapper.current));

  return (
    <div ref={wrapper} className={styles.rightClickMenuWrapper} >
      {props.children[0] || props.children}
      {props.children[1] &&
        <div ref={contentWrapper} className={styles.contentWrapper} >
          {props.children[1]}
        </div>
      }
    </div>
  );
};

export default memo(RightClickMenu);