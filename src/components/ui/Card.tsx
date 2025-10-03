interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

const Card = ({ className, children }: CardProps) => {
  return (
    <div
      className={`p-4 rounded-xl shadow-xl border border-gray-800 bg-[#191725] text-white ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
