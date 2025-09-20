import React from "react";

export default function MdScreenNavComponent() {
  const items = [
    "Fare estimate",
    "Book a taxi",
    "Company website",
    "Contact us",
  ];

  return (
    <div className=" hidden md:flex lg:hidden absolute right-18 top-12 w-60 bg-white shadow-lg rounded-md p-4 z-50">
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-base font-medium text-gray-800 hover:text-blue-600 cursor-pointer transition"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}