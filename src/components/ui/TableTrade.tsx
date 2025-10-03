import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

// Main Table
const TableTrade = ({ children, className = "" }: TableProps) => {
  return (
    <div className="flex flex-col h-full overflow-auto px-3">
      <table className={`${className}`}>{children}</table>
    </div>
  );
};

// Table Header
const TableHeader = ({ children, className = "" }: TableHeaderProps) => {
  return <thead className={`sticky -top-[0.03rem] z-10 bg-main-bg ${className}`}>{children}</thead>;
};

// Table Body
const TableBody = ({ children, className = "" }: TableBodyProps) => {
  return (
    <tbody className={`${className}`}>
      {children}
    </tbody>
  );
};

// Table Row
const TableRow = ({ children, className = "", onClick }: TableRowProps) => {
  return (
    <tr
      className={`${onClick ? "cursor-pointer hover:bg-main/10" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Table Head Cell
const TableHead = ({ children, className = "" }: TableHeadProps) => {
  return (
    <th className={`py-2 ${className}`}>
      <div className="flex items-center">
        <span className="grow text-xs font-normal text-main-link">
          {children}
        </span>
      </div>
    </th>
  );
};

// Table Cell
const TableCell = ({ children, className = "" }: TableCellProps) => {
  return (
    <td
      className={`py-0.5 whitespace-nowrap text-xs font-normal ${className}`}
    >
      {children}
    </td>
  );
};

TableTrade.Header = TableHeader;
TableTrade.Body = TableBody;
TableTrade.Row = TableRow;
TableTrade.Head = TableHead;
TableTrade.Cell = TableCell;

export default TableTrade;
