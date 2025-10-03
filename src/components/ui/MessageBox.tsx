interface MessageBoxProps {
  type?: "success" | "danger" | "warning" | "default";
  children: React.ReactNode;
}

const MessageBox = ({ type = "default", children }: MessageBoxProps) => {
  const typeClass = {
    success: "bg-success-bg/10 text-success-text",
    danger: "bg-danger-bg/10 text-danger-text",
    warning: "bg-warning-bg/10 text-warning-text",
    default: "bg-gray-800/50 border-gray-700 text-gray-300",
  };

  return (
    <div
      className={`flex items-center px-3 py-1.5 rounded-lg border ${typeClass[type]}`}
    >
      {children}
    </div>
  );
};

export default MessageBox;
