import { formatTokenAmount } from "@/utils/formatter";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputTradeProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  secondaryLabel?: string;
  decimals?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTrade = forwardRef<HTMLInputElement, InputTradeProps>(
  ({ label, secondaryLabel, decimals, onChange, ...inputProps }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      e.target.value = formatTokenAmount(value, decimals as number);

      // Call original onChange with modified event
      onChange?.(e);
    };

    return (
      <div
        className={`flex justify-between px-3 py-1.5 mb-3 tracking-wider bg-[#191E2C] border border-gray-700 rounded-md placeholder-gray-400 hover:border-main/75 focus-within:border-main/75  transition-colors duration-200`}
      >
        {label && <span className="me-2 text-main-link">{label}</span>}

        <input
          ref={ref}
          onChange={handleChange}
          className={`grow bg-transparent border-none outline-none text-right font-medium`}
          {...inputProps}
        />

        {secondaryLabel && (
          <span className="ms-2 font-medium">{secondaryLabel}</span>
        )}
      </div>
    );
  }
);

export default InputTrade;
