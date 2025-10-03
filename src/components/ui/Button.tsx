interface ButtonProps {
  variant?: "primary" | "success" | "danger" | "outline" | "transparent";
  type?: "button" | "submit";
  size?: "small" | "base";
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

let variantClass = "";
let sizeClass = "";

const Button = ({
  variant = "primary",
  type = "button",
  size = "base",
  disabled,
  className = "",
  children,
  onClick,
}: ButtonProps) => {
  switch (variant) {
    case "outline":
      variantClass =
        "border border-main hover:opacity-75 disabled:hover:opacity-100";
      break;
    case "success":
      variantClass =
        "bg-success-bg hover:bg-success-bg/80 disabled:hover:bg-success-bg";
      break;
    case "danger":
      variantClass =
        "bg-danger-bg hover:bg-danger-bg/80 disabled:hover:bg-danger-bg";
      break;
    case "transparent":
      variantClass =
        "bg-transparent border border-gray-700 hover:bg-gray-800/30 disabled:hover:bg-transparent";
      break;
    default:
      variantClass = "bg-main hover:bg-main/80 disabled:hover:bg-main";
  }

  switch (size) {
    case "small":
      sizeClass = "text-sm py-1 px-2 font-medium";
      break;
    default:
      sizeClass = "py-1.5 px-4 font-semibold";
  }

  const clickHandler = () => {
    if (disabled) return;
    onClick && onClick();
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-md hover:cursor-pointer disabled:hover:cursor-auto transition-smooth disabled:opacity-50 text-white ${sizeClass} ${variantClass} ${className}`}
      onClick={clickHandler}
    >
      {children}
    </button>
  );
};

export default Button;
