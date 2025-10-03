import { useState, ReactNode, Children, isValidElement } from "react";

interface TabProps {
  id: string;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  children: ReactNode;
  defaultTab?: string;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
  onChange?: (tabId: string) => void;
}

const Tab = ({ children }: TabProps) => {
  return <>{children}</>;
};

const Tabs = ({
  children,
  defaultTab,
  className = "",
  tabClassName = "",
  activeTabClassName = "",
  contentClassName = "",
  onChange,
}: TabsProps) => {
  const tab = Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      isValidElement(child) && child.type === Tab
  );

  const [activeTab, setActiveTab] = useState(defaultTab || tab[0]?.props.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tab.find((tab) => tab.props.id === activeTab)?.props
    .children;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex">
        {tab.map((tab) => (
          <button
            key={tab.props.id}
            onClick={() => handleTabChange(tab.props.id)}
            disabled={tab.props.disabled}
            className={`
              px-3 py-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap hover:cursor-pointer
              ${
                tab.props.disabled
                  ? "text-gray-600 opacity-50"
                  : activeTab === tab.props.id
                    ? `border-b-2 border-main ${activeTabClassName}`
                    : `text-main-link hover:text-main-text ${tabClassName}`
              }
            `}
          >
            {tab.props.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`${contentClassName}`}>{activeTabContent}</div>
    </div>
  );
};

Tabs.Item = Tab;

export default Tabs;
