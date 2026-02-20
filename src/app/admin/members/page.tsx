"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  assignedRcicId: string | null;
  assignedRcicName: string | null;
  assignedRcicEmail: string | null;
  profileJson: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/members")
      .then(async (res) => {
        const data = await res.json();
        if (data.success) setMembers(data.members || []);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">普通会员信息（只读）</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/rcic/review")}
                className="text-gray-600 hover:text-gray-900"
              >
                顾问审核
              </button>
              <button
                onClick={() => router.push("/admin/page-stats")}
                className="text-gray-600 hover:text-gray-900"
              >
                页面点击率
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会员信息</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱验证</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分配顾问</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后登录</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{m.name}</div>
                      <div className="text-sm text-gray-500">{m.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.phone || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      {m.emailVerified ? (
                        <span className="text-green-600">已验证</span>
                      ) : (
                        <span className="text-gray-500">未验证</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {m.assignedRcicName ? (
                        <span>{m.assignedRcicName} {m.assignedRcicEmail ? `(${m.assignedRcicEmail})` : ""}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString("zh-CN") : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(m.createdAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {members.length === 0 && (
            <div className="text-center py-12 text-gray-500">暂无会员</div>
          )}
        </div>
      </div>
    </div>
  );
}
