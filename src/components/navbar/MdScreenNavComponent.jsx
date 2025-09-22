import { mdNavItems } from "../../data/data.jsx";
export default function MdScreenNavComponent() {
 
  return (
    <div className=" hidden md:flex lg:hidden absolute right-18 top-12 w-60 bg-white shadow-lg rounded-md p-4 z-50">
      <ul className="space-y-3">
        {mdNavItems.map((item, index) => (
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