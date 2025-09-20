import React from 'react'

const SmallScreenNavComponent = () => {
      const items = [
    "Fare estimate",
    "Book a taxi",
    "Company website",
    "Contact us",
  ];
  return (

    <div className="w-64 bg-white shadow-lg rounded-lg p-4">
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-lg font-medium text-gray-800 hover:text-blue-600 cursor-pointer transition"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SmallScreenNavComponent
