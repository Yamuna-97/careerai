import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export const SlideTabs = ({ tabs, selected, onSelect, onTabHoverEnter, onTabHoverLeave }) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const tabsRef = useRef([]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];

    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();

      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected]);

  return (
    <ul
      onMouseLeave={() => {
        const selectedTab = tabsRef.current[selected];

        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();

          setPosition({
            left: selectedTab.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className="relative flex w-fit rounded-full border border-outline-variant bg-surface p-1 shadow-sm"
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          setPosition={setPosition}
          onClick={() => onSelect(i)}
          isSelected={selected === i}
          onHoverEnter={onTabHoverEnter ? () => onTabHoverEnter(i) : undefined}
          onHoverLeave={onTabHoverLeave ? () => onTabHoverLeave(i) : undefined}
        >
          {tab}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

const Tab = React.forwardRef(({ children, setPosition, onClick, isSelected, onHoverEnter, onHoverLeave }, ref) => {
  const handleMouseEnter = (e) => {
    const el = e.currentTarget;
    if (el) {
      const { width } = el.getBoundingClientRect();

      setPosition({
        left: el.offsetLeft,
        width,
        opacity: 1,
      });
    }

    if (onHoverEnter) onHoverEnter();
  };

  const handleMouseLeave = () => {
    if (onHoverLeave) onHoverLeave();
  };

  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseOver={handleMouseEnter}
      onPointerEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative z-10 block cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
        isSelected ? "text-on-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </li>
  );
});

Tab.displayName = "Tab";

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={position}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
      className="absolute z-0 h-[28px] rounded-full bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] shadow-md"
    />
  );
};

