"use client";

import { DashboardLayout, StatCard } from "@/components";
import { Select } from "@/components/ui";
import { useDashboard } from "../domain/data/hooks/dashboard_hooks";
import { Book, People, Profile2User, Teacher } from "iconsax-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DashboardPage = () => {
  const { analytics, isLoading, year, setYear, revenue, chartLoading } =
    useDashboard();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const chartData = MONTHS.map((name, i) => ({ name, revenue: revenue[i] ?? 0 }));

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-black">Revenue</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
            <StatCard
              title="Courses"
              value={analytics.courses ?? 0}
              loading={isLoading}
              icon={<Book size={20} color="#717171" />}
            />
            <StatCard
              title="Enrollment"
              value={analytics.enrollment ?? 0}
              loading={isLoading}
              icon={<Teacher size={20} color="#717171" />}
            />
            <StatCard
              title="Instructors"
              value={analytics.instructors ?? 0}
              loading={isLoading}
              icon={<Profile2User size={20} color="#717171" />}
            />
            <StatCard
              title="Students"
              value={analytics.students ?? 0}
              loading={isLoading}
              icon={<People size={20} color="#717171" />}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E7E9EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-black">This Year Revenue</h2>
            <Select
              value={String(year)}
              onChange={(value) => setYear(Number(value))}
              options={years.map((y) => ({ label: String(y), value: String(y) }))}
              className="w-32"
            />
          </div>
          <div className="h-[320px]">
            {chartLoading ? (
              <div className="h-full rounded skeleton" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E9EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#717171" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#717171" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
