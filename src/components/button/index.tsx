import React from "react";

type Props = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "outline" | "bg-transparent" | "border";
};

const ButtonCore = (props: Props) => {
  const { onClick, disabled, className, children, variant = "primary" } = props;
  const customClassName =
    `button-core btn-${variant}` + (className ? ` ${className}` : "");
  return (
    <button onClick={onClick} disabled={disabled} className={customClassName}>
      {children}
    </button>
  );
};

export default ButtonCore;
