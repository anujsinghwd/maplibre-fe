import React, { useState } from 'react';
import './switch.css';

interface ISwitch {
  handleChangeToggle: (check: boolean) => void;
}

const Switch: React.FC<ISwitch> = ({ handleChangeToggle }) => {
  const [isChecked, setIsChecked] = useState(false);

  const toggleSwitch = () => {
    setIsChecked(!isChecked);
    handleChangeToggle(isChecked);
  };

  return (
    <div className="switch-container">
      <label className="switch">
        <input type="checkbox" checked={isChecked} onChange={toggleSwitch} />
        <span className="slider"></span>
      </label>
      <span className="switch-label">{isChecked ? 'Imperial' : 'Metric'}</span>
    </div>
  );
};

export default Switch;
