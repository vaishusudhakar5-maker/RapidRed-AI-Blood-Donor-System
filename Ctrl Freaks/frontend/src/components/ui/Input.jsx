function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="font-semibold text-gray-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
      />
    </div>
  );
}

export default Input;