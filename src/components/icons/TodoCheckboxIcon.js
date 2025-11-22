import React from 'react';
import Svg, { Path } from 'react-native-svg';

const TodoCheckboxIcon = ({ size = 24, color = '#666' }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
    >
      <Path
        d="M512 64c246.4 0 448 201.6 448 448s-201.6 448-448 448S64 758.4 64 512 265.6 64 512 64m0-64C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z"
        fill={color}
      />
    </Svg>
  );
};

export default TodoCheckboxIcon;

