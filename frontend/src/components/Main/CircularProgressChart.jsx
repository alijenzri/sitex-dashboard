export default function CircularProgressChart({ value, goal, label, color = "#2563eb", size = 180 }) {
    const radius = size / 2;
    const stroke = size / 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const percent = Math.min(Math.max(value / goal, 0), 1);
    const strokeDashoffset = circumference - percent * circumference;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <svg height={size} width={size} className="mb-2">
                <circle
                    stroke="#e5e7eb"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference + " " + circumference}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize={size / 4.5}
                    fill={color}
                    fontWeight="bold"
                >
                    {Math.round(value)}%
                </text>
            </svg>
            <div className="text-gray-500 text-sm mb-2">Objectif: {goal}%</div>
            <div className="w-full flex flex-col items-center">
                <div className="w-11/12 h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-2 rounded-full"
                        style={{
                            width: `${(value / goal) * 100}%`,
                            background: color,
                            transition: "width 0.5s"
                        }}
                    />
                </div>
            </div>
        </div>
    );
}