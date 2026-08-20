function SectionTitle({ title, highlight, subtitle }) {
  return (
    <div className="text-center mb-14">
      <h2 className="text-4xl md:text-5xl font-bold">
        {title}{" "}
        <span className="text-red-600">
          {highlight}
        </span>
      </h2>

      <p className="mt-5 text-gray-600 max-w-3xl mx-auto text-lg">
        {subtitle}
      </p>
    </div>
  );
}

export default SectionTitle;