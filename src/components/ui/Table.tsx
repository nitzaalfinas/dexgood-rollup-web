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
const Table = ({ children, className = "" }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full ${className}`}>
        {children}
      </table>
    </div>
  );
};

// Table Header
const TableHeader = ({ children, className = "" }: TableHeaderProps) => {
  return <thead className={`${className}`}>{children}</thead>;
};

// Table Body
const TableBody = ({ children, className = "" }: TableBodyProps) => {
  return (
    <tbody className={`divide-y divide-gray-800 ${className}`}>
      {children}
    </tbody>
  );
};

// Table Row
const TableRow = ({ children, className = "", onClick }: TableRowProps) => {
  return (
    <tr
      className={`rounded-2xl ${onClick ? "cursor-pointer hover:bg-main/10" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Table Head Cell
const TableHead = ({ children, className = "" }: TableHeadProps) => {
  return (
    <th
      className={`px-4 py-1.5 text-xs font-light text-gray-400 tracking-wider ${className}`}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
      </div>
    </th>
  );
};

// Table Cell
const TableCell = ({ children, className = "" }: TableCellProps) => {
  return (
    <td
      className={`px-4 py-2.5 whitespace-nowrap text-sm font-medium ${className}`}
    >
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;
