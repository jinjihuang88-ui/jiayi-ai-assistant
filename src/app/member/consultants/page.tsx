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
  typeLabel?: string;
  statusLabel?: string;
}

interface IRCCConsultantItem {
  id: string;
  licenseNumber: string;
  registrationStatus: string;
  companyAddress: string | null;
  region: string | null;
  websiteUrl: string | null;
  name: string | null;
}

export default function ConsultantsPage() {
  const router = useRouter();
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [irccConsultants, setIrccConsultants] = useState<IRCCConsultantItem[]>([]);
  const [irccRegionOptions, setIrccRegionOptions] = useState<string[]>([]);
  const [irccRegionFilter, setIrccRegionFilter] = useState<string>("");
  const [irccLoading, setIrccLoading] = useState(true);
  const [contracted, setContracted] = useState<boolean | null>(null);

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    fetch("/api/member/contract-status")
      .then((r) => r.json())
      .then((d) => d.success && setContracted(!!d.contracted))
      .catch(() => setContracted(false));
  }, []);

  useEffect(() => {
    fetchIrccConsultants(irccRegionFilter || undefined);
  }, [irccRegionFilter]);

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

  const fetchIrccConsultants = async (region?: string) => {
    setIrccLoading(true);
    try {
      const url = region
        ? `/api/member/consultants/ircc-official?region=${encodeURIComponent(region)}`
        : "/api/member/consultants/ircc-official";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setIrccConsultants(data.consultants);
        setIrccRegionOptions(data.regionOptions || []);
      }
    } catch (error) {
      console.error("获取 IRCC 官方名录失败:", error);
    } finally {
      setIrccLoading(false);
    }
  };

  const handleSelectConsultant = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowModal(true);
    // 上报查看次数（管理后台可看点击率）
    fetch(`/api/member/consultants/${consultant.id}/view`, { method: "POST" }).catch(() => {});
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
        setShowModal(false);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {contracted === true && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-amber-800 text-sm">
              您已与顾问签约，无法更换顾问。如需更换，请先在消息页取消合约后再选择新顾问。
            </p>
            <a
              href="/member/messages"
              className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
            >
              前往消息
            </a>
          </div>
        )}
        {/* 一、平台入驻顾问（原有逻辑不变） */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            平台入驻顾问
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            以下顾问已入驻本平台，您可以选择其一作为您的移民顾问。
          </p>
          {consultants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
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
                  {consultant.typeLabel && (
                    <span className="inline-block px-2 py-0.5 bg-[#C62828]/10 text-[#C62828] text-xs font-medium rounded mb-2">
                      {consultant.typeLabel}
                    </span>
                  )}
                  {consultant.licenseNumber && (
                    <p className="text-sm text-slate-600 mb-1">
                      牌照号：<span className="font-medium text-slate-800">{consultant.licenseNumber}</span>
                    </p>
                  )}
                  {(consultant.country || consultant.city) && (
                    <p className="text-sm text-slate-600 mb-2">
                      地区：{[consultant.country, consultant.city].filter(Boolean).join(" · ")}
                    </p>
                  )}
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
                            {region}
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
                    onClick={() => !contracted && handleSelectConsultant(consultant)}
                    disabled={contracted === true || !consultant.isAcceptingCases}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${
                      contracted || !consultant.isAcceptingCases
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                    }`}
                  >
                    {contracted ? "已签约，无法更换" : consultant.isAcceptingCases ? "选择此顾问" : "暂不接收新案件"}
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </section>

        {/* 二、IRCC 官方持牌顾问名录（仅公开信息，未入驻，按地区筛选） */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            IRCC 官方持牌顾问名录
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            以下为 IRCC 官方公开注册信息，仅供查阅与筛选；该名录中的顾问未入驻本平台，不可在此选择。
          </p>
          <div className="mb-4 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-600">按地区筛选：</span>
              <select
                value={irccRegionFilter}
                onChange={(e) => setIrccRegionFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white min-w-[140px]"
              >
                <option value="">全部地区</option>
                {irccRegionOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500">
              官方名录当前不包含地区字段，仅展示「全部地区」。若需按省/城市筛选，请前往
              <a
                href="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                College 官网查询
              </a>
              。
            </p>
          </div>
          {irccLoading ? (
            <div className="py-12 text-center text-slate-500">加载中...</div>
          ) : irccConsultants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <div className="text-slate-400 text-lg">暂无公开名录数据</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {irccConsultants.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-5"
                >
                  {c.name && (
                    <h3 className="text-base font-semibold text-slate-900 mb-2">{c.name}</h3>
                  )}
                  <dl className="space-y-1.5 text-sm">
                    <div>
                      <dt className="text-slate-500 inline">注册编号：</dt>
                      <dd className="inline font-medium text-slate-800">{c.licenseNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 inline">注册状态：</dt>
                      <dd className="inline text-slate-700">{c.registrationStatus}</dd>
                    </div>
                    {c.region && (
                      <div>
                        <dt className="text-slate-500 inline">地区：</dt>
                        <dd className="inline text-slate-700">{c.region}</dd>
                      </div>
                    )}
                    {c.companyAddress && (
                      <div>
                        <dt className="text-slate-500 block mb-0.5">公司地址：</dt>
                        <dd className="text-slate-700">{c.companyAddress}</dd>
                      </div>
                    )}
                  </dl>
                  {c.websiteUrl && (
                    <a
                      href={c.websiteUrl.startsWith("http") ? c.websiteUrl : `https://${c.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      官网链接
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 信息来源声明 */}
        <footer className="pt-8 pb-4 border-t border-slate-200 text-center text-sm text-slate-500">
          信息来源声明：信息来源于公开渠道，仅供参考。
        </footer>
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
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">
                    {selectedConsultant.name}
                  </div>
                  {selectedConsultant.licenseNumber && (
                    <div className="text-sm text-slate-600">
                      牌照号：{selectedConsultant.licenseNumber}
                    </div>
                  )}
                  {(selectedConsultant.country || selectedConsultant.city) && (
                    <div className="text-sm text-slate-600">
                      地区：{[selectedConsultant.country, selectedConsultant.city].filter(Boolean).join(" · ")}
                    </div>
                  )}
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
