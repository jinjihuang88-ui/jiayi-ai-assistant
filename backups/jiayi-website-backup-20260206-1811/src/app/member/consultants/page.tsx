"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Consultant {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  profilePhoto: string | null;
  licenseNumber: string | null;
  yearsOfExperience: number | null;
  country: string | null;
  city: string | null;
  organization: string | null;
  bio: string | null;
  specialties: string[];
  serviceRegions: string[];
  successRate: number | null;
  totalCases: number | null;
  successfulCases: number | null;
  averageRating: number | null;
  totalReviews: number | null;
  languages: string[];
  certifications: string[];
  isAcceptingCases: boolean;
  isOnline: boolean;
  lastActiveAt: string | null;
}

export default function ConsultantsPage() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const res = await fetch("/api/member/consultants");
      const data = await res.json();
      
      if (data.success) {
        setConsultants(data.consultants);
      }
    } catch (error) {
      console.error("获取顾问列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowModal(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedConsultant) return;
    
    try {
      const res = await fetch('/api/member/assign-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: selectedConsultant.id,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert(data.message || '顾问分配成功');
        setShowModal(false);
        router.push('/member');
      } else {
        alert(data.message || '分配失败');
      }
    } catch (error) {
      console.error('分配顾问失败:', error);
      alert('分配失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <span>←</span>
              <span>返回</span>
            </button>
            <h1 className="text-xl font-semibold text-slate-900">选择移民顾问</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* 顾问列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {consultants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">暂无可用顾问</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.map((consultant) => (
              <div
                key={consultant.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* 顾问头部 */}
                <div className="relative h-32 bg-gradient-to-br from-blue-500 to-cyan-500">
                  {consultant.isOnline && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      在线
                    </div>
                  )}
                </div>

                {/* 顾问照片 */}
                <div className="relative px-6 -mt-16 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                    {consultant.profilePhoto || consultant.avatar ? (
                      <img
                        src={consultant.profilePhoto || consultant.avatar || ''}
                        alt={consultant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                        {consultant.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 顾问信息 */}
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {consultant.name}
                  </h3>
                  
                  {consultant.organization && (
                    <p className="text-sm text-slate-600 mb-2">{consultant.organization}</p>
                  )}

                  {/* 评分和经验 */}
                  <div className="flex items-center gap-4 mb-3">
                    {consultant.averageRating !== null && consultant.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium text-slate-900">
                          {consultant.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({consultant.totalReviews}评价)
                        </span>
                      </div>
                    )}
                    {consultant.yearsOfExperience && (
                      <div className="text-sm text-slate-600">
                        {consultant.yearsOfExperience}年经验
                      </div>
                    )}
                  </div>

                  {/* 成功率 */}
                  {consultant.successRate !== null && consultant.successRate > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600">成功率</span>
                        <span className="font-medium text-green-600">
                          {consultant.successRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${consultant.successRate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        成功案件: {consultant.successfulCases} / {consultant.totalCases}
                      </div>
                    </div>
                  )}

                  {/* 专业领域 */}
                  {consultant.specialties.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-600 mb-1">专业领域</div>
                      <div className="flex flex-wrap gap-1">
                        {consultant.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                        {consultant.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                            +{consultant.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 服务区域 */}
                  {consultant.serviceRegions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-600 mb-1">服务区域</div>
                      <div className="flex flex-wrap gap-1">
                        {consultant.serviceRegions.slice(0, 2).map((region, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs"
                          >
                            📍 {region}
                          </span>
                        ))}
                        {consultant.serviceRegions.length > 2 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                            +{consultant.serviceRegions.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 语言能力 */}
                  {consultant.languages.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-600 mb-1">语言能力</div>
                      <div className="text-sm text-slate-700">
                        {consultant.languages.join(", ")}
                      </div>
                    </div>
                  )}

                  {/* 选择按钮 */}
                  <button
                    onClick={() => handleSelectConsultant(consultant)}
                    disabled={!consultant.isAcceptingCases}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      consultant.isAcceptingCases
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {consultant.isAcceptingCases ? "选择此顾问" : "暂不接收新案件"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 确认模态框 */}
      {showModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              确认选择顾问
            </h2>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200">
                  {selectedConsultant.profilePhoto || selectedConsultant.avatar ? (
                    <img
                      src={selectedConsultant.profilePhoto || selectedConsultant.avatar || ''}
                      alt={selectedConsultant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
                      {selectedConsultant.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {selectedConsultant.name}
                  </div>
                  {selectedConsultant.organization && (
                    <div className="text-sm text-slate-600">
                      {selectedConsultant.organization}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600">
                您确定要选择 <span className="font-medium text-slate-900">{selectedConsultant.name}</span> 作为您的移民顾问吗？
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSelection}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600"
              >
                确认选择
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
