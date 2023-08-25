import React, { useState } from 'react';

const Switch: React.FC<{handleChangeToggle: any}> = ({ handleChangeToggle }) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleToggle = () => {
        setIsChecked(!isChecked);
        handleChangeToggle(!isChecked);
    };

    return (
        <label>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={handleToggle}
            />
            {isChecked ? 'Imperial' : 'Metric'}
        </label>
    );
};

export default Switch;
