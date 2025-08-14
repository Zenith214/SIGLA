"use client";

interface ServiceArea {
  name: string;
  satisfied: {
    percentage: number;
    level: "High" | "Low";
  };
  needForAction: {
    percentage: number;
    level: "High" | "Low";
  };
  priority: "Priority" | "Opportunity" | "Strength";
}

interface ServiceAreaTableProps {
  serviceAreas: ServiceArea[];
  className?: string;
}

const getPriorityColor = (priority: ServiceArea["priority"]) => {
  switch (priority) {
    case "Priority":
      return "bg-red-100 text-red-800 border-red-200";
    case "Opportunity":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Strength":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ServiceAreaTable({ serviceAreas, className = "" }: ServiceAreaTableProps) {
  return (
    <div className={`bg-white px-6 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-8 text-center">
          Service Area Breakdown
        </h2>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                  Service Area
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  Satisfied
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  Need for Action
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody>
              {serviceAreas.map((area, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900">
                    {area.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900">{area.satisfied.percentage}%</span>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        area.satisfied.level === "High" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {area.satisfied.level}
                      </span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-gray-900">{area.needForAction.percentage}%</span>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        area.needForAction.level === "High" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {area.needForAction.level}
                      </span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(area.priority)}`}>
                      {area.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {serviceAreas.map((area, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">{area.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Satisfied:</span>
                  <div className="mt-1">
                    <span className="font-semibold">{area.satisfied.percentage}%</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      area.satisfied.level === "High" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {area.satisfied.level}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Need for Action:</span>
                  <div className="mt-1">
                    <span className="font-semibold">{area.needForAction.percentage}%</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      area.needForAction.level === "High" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {area.needForAction.level}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(area.priority)}`}>
                  {area.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}