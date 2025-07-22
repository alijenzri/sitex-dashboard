import { motion } from "framer-motion";
import { FaChartBar, FaCube, FaCheckCircle, FaBolt } from "react-icons/fa";

const iconMap = {
    chart: <FaChartBar className="text-white w-6 h-6" />,
    cube: <FaCube className="text-white w-6 h-6" />,
    check: <FaCheckCircle className="text-white w-6 h-6" />,
    bolt: <FaBolt className="text-white w-6 h-6" />,
};

const bgMap = {
    chart: "bg-blue-600",
    cube: "bg-purple-600",
    check: "bg-green-600",
    bolt: "bg-yellow-500",
};

export default function StateCard({ icon, title, value, percentage, info }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl bg-white p-5 shadow transition hover:shadow-lg focus-within:ring-2 ring-blue-500"
        >
            <div className={`p-3 rounded-lg ${bgMap[icon]}`}>
                {iconMap[icon]}
            </div>

            <div className="flex flex-col">
                <p className="text-sm text-gray-500">{title}</p>
                <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
                <p className="text-xs text-gray-500 mt-1">
                    <span className={typeof percentage === "string" && percentage.startsWith('+') ? "text-green-500" : "text-red-500"}>
                        {percentage}
                    </span>{" "}
                    {info}
                </p>
            </div>
        </motion.div>
    );
}
