import { type ElementType } from "react";

interface ActionButtonProps {
  icon: ElementType;
  label: string;
  onClick: () => void;
  color: string;
  textColor: string;
  disabled?: boolean;
  className?: string;
  size?: string;
}

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  color,
  textColor,
  disabled,
  className = "",
  size = "py-5",
}: ActionButtonProps) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`${color} ${textColor} w-full ${size} rounded-none border-3 border-cb-black-pure font-tech font-black uppercase text-xs md:text-sm flex flex-col items-center justify-center gap-1 md:gap-2 active:scale-95 transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none ${className}`}
  >
    <Icon size={24} strokeWidth={2.5} className="mb-1" />
    <span className="leading-tight text-center px-1">{label}</span>
  </button>
);
