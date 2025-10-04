import PlagiarismIcon from "@mui/icons-material/Plagiarism";

interface EmptyDataProps {
  icon?: React.ComponentType<{
    fontSize?: "small" | "medium" | "large" | "inherit";
    className?: string;
    style?: React.CSSProperties;
  }>;
  title?: string;
  onAction?: () => void;
  actionText?: string;
  className?: string;
}

const EmptyData = ({
  icon: IconComponent = PlagiarismIcon,
  title = "No data available",
  onAction,
  actionText = "Action",
  className = ""
}: EmptyDataProps) => {
  return (
    <div className={`flex flex-col items-center text-center py-10 ${className}`}>
      <IconComponent
        className="mb-2 text-main-link"
        style={{ fontSize: "3rem" }}
      />

      <h5 className="text-main-link">{title}</h5>

      {/* Action Button */}
      {actionText && onAction && (
        <button className="transparent-btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyData;
