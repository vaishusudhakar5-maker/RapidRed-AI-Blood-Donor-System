import { Link } from "react-router-dom";

function Button({
  children,
  variant = "primary",
  to,
  onClick,
  type = "button",
  className = "",
}) {
  const styles = {
    primary:
      "w-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl",

    secondary:
      "border border-red-600 text-red-600 hover:bg-red-50",
  };

  const classes = `px-6 py-3 rounded-xl font-semibold transition duration-300 ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}

export default Button;