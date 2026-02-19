"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PageStat {
  path: string;
  label: string;
  viewCount: number;
}

export default function AdminPageStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/page-stats")
      .then(async (res) => {
        const data = await res.json();
        if (data.success) setStats(data.stats || []);
        else if (res.status === 401) router.push("/admin/login");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">页面点击率</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/rcic/review")}
                className="text-gray-600 hover:text-gray-900"
              >
                顾问审核
              </button>
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6">
          统计 www.jiayi.co 与 www.jiayi.co/risk-compass 的访问次数（每次页面加载计 1 次）。
        </p>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  页面
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  访问次数（点击率）
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                    暂无数据（访问首页或风险罗盘后会自动记录）
                  </td>
                </tr>
              ) : (
                stats.map((s) => (
                  <tr key={s.path} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.label}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.viewCount.toLocaleString()} 次</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
