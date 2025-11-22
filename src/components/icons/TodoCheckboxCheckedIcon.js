import React from 'react';
import Svg, { Path } from 'react-native-svg';

const TodoCheckboxCheckedIcon = ({ size = 24, color = '#2E4454' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
    >
      <Path
        d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768zM195.2 195.2a448 448 0 1 1 633.6 633.6A448 448 0 0 1 195.2 195.2z m499.424 214.176a32 32 0 0 1 0 45.248l-192 192a32 32 0 0 1-45.248 0l-112-112a32 32 0 0 1 45.248-45.248L480 578.752l169.376-169.376a32 32 0 0 1 45.248 0z"
        fill={color}
      />
    </Svg>
  );
};

export default TodoCheckboxCheckedIcon;

