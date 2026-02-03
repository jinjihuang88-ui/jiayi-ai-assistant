"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface RCICConsultant {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  consultantType: string;
  country: string | null;
  city: string | null;
  organization: string | null;
  licenseNumber: string | null;
  idDocument: string | null;
  licenseDocument: string | null;
  experienceProof: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  approvalStatus: string;
  approvalNotes: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminReviewPage() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<RCICConsultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<RCICConsultant | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const response = await fetch("/api/admin/rcic/list");
      const data = await response.json();

      if (data.success) {
        setConsultants(data.consultants);
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Failed to fetch consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedConsultant || !reviewAction) return;

    if (reviewAction === "reject" && !reviewNotes.trim()) {
      alert("拒绝时必须填写原因");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/rcic/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rcicId: selectedConsultant.id,
          action: reviewAction,
          notes: reviewNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(reviewAction === "approve" ? "审核通过！" : "已拒绝申请");
        setSelectedConsultant(null);
        setReviewAction(null);
        setReviewNotes("");
        fetchConsultants(); // 刷新列表
      } else {
        alert(data.message || "审核失败");
      }
    } catch (error) {
      console.error("Review error:", error);
      alert("审核失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "待审核", color: "bg-yellow-100 text-yellow-800" },
      approved: { label: "已通过", color: "bg-green-100 text-green-800" },
      rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" },
    };

    const { label, color } = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getConsultantTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      A: "A类 - 持牌顾问",
      B: "B类 - 留学顾问",
      C: "C类 - 文案辅助",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">RCIC 顾问审核</h1>
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">待审核</div>
            <div className="text-3xl font-bold text-yellow-600">
              {consultants.filter((c) => c.approvalStatus === "pending").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">已通过</div>
            <div className="text-3xl font-bold text-green-600">
              {consultants.filter((c) => c.approvalStatus === "approved").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">已拒绝</div>
            <div className="text-3xl font-bold text-red-600">
              {consultants.filter((c) => c.approvalStatus === "rejected").length}
            </div>
          </div>
        </div>
      </div>

      {/* Consultants List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顾问信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultants.map((consultant) => (
                <tr key={consultant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{consultant.name}</div>
                    <div className="text-sm text-gray-500">{consultant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getConsultantTypeName(consultant.consultantType)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(consultant.approvalStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(consultant.createdAt).toLocaleString("zh-CN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedConsultant(consultant)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {consultants.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无顾问申请
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">顾问详情</h2>
              <button
                onClick={() => {
                  setSelectedConsultant(null);
                  setReviewAction(null);
                  setReviewNotes("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">姓名</div>
                    <div className="text-base font-medium">{selectedConsultant.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">邮箱</div>
                    <div className="text-base font-medium">{selectedConsultant.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">电话</div>
                    <div className="text-base font-medium">{selectedConsultant.phone || "未填写"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">顾问类型</div>
                    <div className="text-base font-medium">
                      {getConsultantTypeName(selectedConsultant.consultantType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">居住地</div>
                    <div className="text-base font-medium">
                      {selectedConsultant.country || "未填写"} - {selectedConsultant.city || "未填写"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">邮箱验证</div>
                    <div className="text-base font-medium">
                      {selectedConsultant.emailVerified ? "✅ 已验证" : "❌ 未验证"}
                    </div>
                  </div>
                </div>
              </div>

              {/* A类顾问信息 */}
              {selectedConsultant.consultantType === "A" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">资质信息（A类）</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">执照号</div>
                      <div className="text-base font-medium">{selectedConsultant.licenseNumber || "未填写"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">执业机构</div>
                      <div className="text-base font-medium">{selectedConsultant.organization || "未填写"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* B类顾问信息 */}
              {selectedConsultant.consultantType === "B" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">资质信息（B类）</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">从业年限</div>
                      <div className="text-base font-medium">
                        {selectedConsultant.yearsOfExperience ? `${selectedConsultant.yearsOfExperience}年` : "未填写"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">上传文件</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedConsultant.idDocument && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">身份证件</div>
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={selectedConsultant.idDocument}
                          alt="身份证件"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {selectedConsultant.licenseDocument && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">执照证书</div>
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={selectedConsultant.licenseDocument}
                          alt="执照证书"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Status */}
              {selectedConsultant.approvalStatus !== "pending" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">审核信息</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">审核状态</div>
                    <div className="mt-1">{getStatusBadge(selectedConsultant.approvalStatus)}</div>
                    {selectedConsultant.approvalNotes && (
                      <>
                        <div className="text-sm text-gray-600 mt-3">审核备注</div>
                        <div className="text-base mt-1">{selectedConsultant.approvalNotes}</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Review Actions */}
              {selectedConsultant.approvalStatus === "pending" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">审核操作</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setReviewAction("approve")}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          reviewAction === "approve"
                            ? "bg-green-600 text-white"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        ✓ 通过
                      </button>
                      <button
                        onClick={() => setReviewAction("reject")}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          reviewAction === "reject"
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        ✕ 拒绝
                      </button>
                    </div>

                    {reviewAction && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {reviewAction === "approve" ? "审核备注（可选）" : "拒绝原因（必填）"}
                        </label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder={
                            reviewAction === "approve"
                              ? "可填写审核备注..."
                              : "请说明拒绝原因，以便顾问修改后重新提交"
                          }
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}

                    {reviewAction && (
                      <button
                        onClick={handleReview}
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {submitting ? "提交中..." : "确认提交"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
