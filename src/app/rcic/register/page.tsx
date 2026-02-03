"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type ConsultantLevel = "A" | "B" | "C";

interface FormData {
  // Step 1: 基本信息
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: 身份验证
  nameCn: string;
  nameEn: string;
  idDocument: File | null;
  country: string;
  city: string;
  phone: string;
  
  // Step 3: 顾问资质
  level: ConsultantLevel;
  // A类字段
  licenseNo: string;
  organization: string;
  verificationLink: string;
  licenseCertificate: File | null;
  // B类字段
  yearsOfExperience: string;
  serviceScope: string;
  pastCases: string;
  // C类字段
  specialties: string;
  workExperience: string;
}

export default function RCICRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nameCn: "",
    nameEn: "",
    idDocument: null,
    country: "",
    city: "",
    phone: "",
    level: "A",
    licenseNo: "",
    organization: "",
    verificationLink: "",
    licenseCertificate: null,
    yearsOfExperience: "",
    serviceScope: "",
    pastCases: "",
    specialties: "",
    workExperience: "",
  });
  
  const [modal, setModal] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const showModal = (message: string, type: "success" | "error") => {
    setModal({ show: true, message, type });
  };

  const closeModal = () => {
    setModal({ show: false, message: "", type: "success" });
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password) {
      showModal("请填写所有必填字段", "error");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showModal("两次输入的密码不一致", "error");
      return false;
    }
    if (formData.password.length < 6) {
      showModal("密码长度至少6位", "error");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    console.log("[DEBUG] validateStep2 called");
    console.log("[DEBUG] formData:", formData);
    
    const missingFields = [];
    if (!formData.nameCn) {
      console.log("[DEBUG] Missing: nameCn");
      missingFields.push("中文姓名");
    }
    if (!formData.nameEn) {
      console.log("[DEBUG] Missing: nameEn");
      missingFields.push("英文姓名");
    }
    if (!formData.idDocument) {
      console.log("[DEBUG] Missing: idDocument");
      missingFields.push("身份证件");
    }
    if (!formData.country) {
      console.log("[DEBUG] Missing: country");
      missingFields.push("居住地");
    }
    if (!formData.city) {
      console.log("[DEBUG] Missing: city");
      missingFields.push("城市");
    }
    if (!formData.phone) {
      console.log("[DEBUG] Missing: phone");
      missingFields.push("电话");
    }
    
    console.log("[DEBUG] missingFields:", missingFields);
    
    if (missingFields.length > 0) {
      const errorMsg = `请填写以下必填字段：${missingFields.join("、")}`;
      console.log("[DEBUG] Error message:", errorMsg);
      showModal(errorMsg, "error");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.level === "A") {
      if (!formData.licenseNo || !formData.verificationLink || !formData.licenseCertificate || !formData.organization) {
        showModal("A类顾问必须填写执照号、查询链接、执业机构并上传执照证书", "error");
        return false;
      }
    } else if (formData.level === "B") {
      if (!formData.yearsOfExperience || !formData.serviceScope || !formData.pastCases) {
        showModal("B类顾问必须填写从业年限、服务范围和过往案例", "error");
        return false;
      }
    } else if (formData.level === "C") {
      if (!formData.specialties || !formData.workExperience) {
        showModal("C类顾问必须填写擅长领域和工作经验", "error");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFileChange = (field: "idDocument" | "licenseCertificate", file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      showModal("文件大小不能超过5MB", "error");
      return;
    }
    setFormData({ ...formData, [field]: file });
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      // 上传文件
      const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!data.success) throw new Error("文件上传失败");
        return data.url;
      };

      const idDocumentUrl = formData.idDocument ? await uploadFile(formData.idDocument) : "";
      const licenseCertificateUrl = formData.licenseCertificate ? await uploadFile(formData.licenseCertificate) : "";

      // 提交注册
      const requestData = {
          email: formData.email,
          password: formData.password,
          name: `${formData.nameCn} / ${formData.nameEn}`, // 合并中英文姓名
          phone: formData.phone,
          consultantType: formData.level, // level -> consultantType
          country: formData.country,
          city: formData.city,
          idDocument: idDocumentUrl, // idDocumentUrl -> idDocument
          // A类顾问字段
          licenseNumber: formData.licenseNo || null, // licenseNo -> licenseNumber
          organization: formData.organization || null,
          licenseDocument: licenseCertificateUrl || null, // licenseCertificateUrl -> licenseDocument
          // B类顾问字段
          yearsOfExperience: formData.yearsOfExperience || null,
          experienceProof: formData.pastCases || null, // pastCases -> experienceProof
          // C类顾问字段
          bio: formData.workExperience || formData.specialties || null, // workExperience/specialties -> bio
        };
      
      console.log("[DEBUG] Sending registration data:", requestData);
      
      const response = await fetch("/api/rcic/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        showModal("注册成功！您的申请已提交审核，请等待管理员审核通过。", "success");
        setTimeout(() => {
          router.push("/rcic/login");
        }, 3000);
      } else {
        showModal(data.message || "注册失败，请重试", "error");
      }
    } catch (error) {
      console.error("Register error:", error);
      showModal("注册失败，请重试", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4 py-8">
      {/* 返回首页按钮 */}
      <Link 
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-purple-600 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">返回首页</span>
      </Link>

      {/* 弹窗提示 */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={closeModal}></div>
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full animate-slide-down">
            <div className="p-6">
              <div className="flex items-start mb-4">
                {modal.type === "success" ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modal.type === "success" ? "成功" : "错误"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{modal.message}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">顾问注册</h1>
          <p className="text-gray-600">创建顾问账号 - 需人工审核</p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-16 rounded-full ${step >= s ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            第 {step} 步 / 共 4 步
          </div>
        </div>

        {/* Step 1: 基本信息 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="请输入密码（至少6位）"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="请再次输入密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              下一步
            </button>
          </div>
        )}

        {/* Step 2: 身份验证 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  中文姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameCn}
                  onChange={(e) => setFormData({ ...formData, nameCn: e.target.value })}
                  placeholder="请输入中文姓名"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  英文姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="English Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身份证件 <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileChange("idDocument", e.target.files?.[0] || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-gray-500">支持 JPG, PNG, PDF，最大5MB</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  居住国家 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="如：加拿大"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  居住城市 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="如：多伦多"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入联系电话"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 顾问资质 */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                顾问等级 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "A", title: "A类 - 持牌顾问/律师", desc: "持有RCIC执照或律师执照" },
                  { value: "B", title: "B类 - 留学/签证顾问", desc: "有行业经验但非移民持牌" },
                  { value: "C", title: "C类 - 文案/辅助人员", desc: "文书、翻译、材料整理" },
                ].map((level) => (
                  <label key={level.value} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={formData.level === level.value}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as ConsultantLevel })}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{level.title}</div>
                      <div className="text-sm text-gray-600">{level.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* A类字段 */}
            {formData.level === "A" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RCIC执照号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    placeholder="请输入RCIC执照号"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    执照查询链接 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.verificationLink}
                    onChange={(e) => setFormData({ ...formData, verificationLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">可公开查询的执照验证链接</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    执照证书 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange("licenseCertificate", e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">上传执照证书照片或扫描件</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    执业机构
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="请输入所属机构（必填）"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {/* B类字段 */}
            {formData.level === "B" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    从业年限 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">请选择</option>
                    <option value="1-3年">1-3年</option>
                    <option value="3-5年">3-5年</option>
                    <option value="5-10年">5-10年</option>
                    <option value="10年以上">10年以上</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    服务范围 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.serviceScope}
                    onChange={(e) => setFormData({ ...formData, serviceScope: e.target.value })}
                    placeholder="请描述您的服务范围（如：留学申请、访客签证等）"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    过往案例 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.pastCases}
                    onChange={(e) => setFormData({ ...formData, pastCases: e.target.value })}
                    placeholder="请简要描述您的成功案例（脱敏处理）"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {/* C类字段 */}
            {formData.level === "C" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    擅长领域 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    placeholder="请描述您擅长的领域（如：文书翻译、材料整理等）"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工作经验 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.workExperience}
                    onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                    placeholder="请简要描述您的工作经验"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 审核提交 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">审核说明</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 您的申请将提交给平台管理员进行人工审核</li>
                <li>• 审核时间通常为 1-3 个工作日</li>
                <li>• 审核通过后，您将收到邮件通知</li>
                <li>• 审核期间您可以登录查看审核状态</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">信息确认</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">邮箱：</span><span className="font-medium">{formData.email}</span></div>
                <div><span className="text-gray-600">姓名：</span><span className="font-medium">{formData.nameCn} / {formData.nameEn}</span></div>
                <div><span className="text-gray-600">居住地：</span><span className="font-medium">{formData.country} - {formData.city}</span></div>
                <div><span className="text-gray-600">电话：</span><span className="font-medium">{formData.phone}</span></div>
                <div><span className="text-gray-600">顾问等级：</span><span className="font-medium">{formData.level}类</span></div>
                {formData.level === "A" && (
                  <div><span className="text-gray-600">执照号：</span><span className="font-medium">{formData.licenseNo}</span></div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "提交中..." : "提交审核"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          已有账号？
          <Link href="/rcic/login" className="text-purple-600 hover:text-purple-700 font-medium ml-1">
            立即登录
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
