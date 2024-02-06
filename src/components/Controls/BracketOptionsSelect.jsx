import React from "react";
import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

export default function BracketOptionsSelect({ label, onChange, value, disabled, children, minWidth }) {
  return (
    <div className={`relative max-w-fit ${minWidth}`}>
      <Select value={String(value)} onValueChange={onChange} disabled={disabled} id={`${label}-select`}>
        <SelectTrigger className="font-bold whitespace-nowrap">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      <Label
        htmlFor={`${label}-select`}
        className="absolute
                text-[0.7rem]
                text-black
                transform 
                -translate-y-4
                -translate-x-1 
                top-2 
                z-10 
                origin-[0] 
                bg-white
                border-gray-500
                left-1
                px-2
                rounded
                font-normal
                border"
      >
        {label}
      </Label>
    </div>
  );
}
