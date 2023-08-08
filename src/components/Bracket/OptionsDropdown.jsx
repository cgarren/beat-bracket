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
                pr-[20px]
                font-bold
                w-full
                text-sm
                text-gray-900
                bg-white
                rounded-lg
                rounded-tl-none
                focus:outline-none
                focus:ring-0
                border
                border-transparent
                focus:border-blue-600
                appearance-none
                bg-[url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0ye2ZpbGw6IzQ0NDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmFycm93czwvdGl0bGU+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjEuNDEgNC42NyAyLjQ4IDMuMTggMy41NCA0LjY3IDEuNDEgNC42NyIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIzLjU0IDUuMzMgMi40OCA2LjgyIDEuNDEgNS4zMyAzLjU0IDUuMzMiLz48L3N2Zz4=)]
                bg-right
                bg-no-repeat
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
