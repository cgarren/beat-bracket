import React from "react";

const OptionsDropdown = ({
    label,
    onChange,
    value,
    disabled,
    children,
    minWidth,
}) => {
    return (
        <div className={`relative max-w-fit ${minWidth}`}>
            <select
                name={label}
                id={`${label}-select`}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="
                block
                pl-2.5
                pb-2
                pt-3
                pr-0
                font-bold
                w-full
                text-sm
                text-gray-900
                bg-white
                rounded-lg
                rounded-tl-none
                border-gray-500
                focus:outline-none
                focus:ring-0
                focus:border-blue-600
                peer"
            >
                {children}
            </select>
            <label
                className="absolute 
                text-xs
                text-black
                transform 
                -translate-y-4
                -translate-x-1 
                top-2 
                z-10 
                origin-[0] 
                bg-white
                border-gray-500
                px-2
                peer-focus:px-2 
                rounded
                border
                peer-focus:border-blue-600
                left-1"
                htmlFor={`${label}-select`}
            >
                {label}
            </label>
        </div>
    );
};

export default OptionsDropdown;
