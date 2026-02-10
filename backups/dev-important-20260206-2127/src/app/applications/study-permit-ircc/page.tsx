"use client";

export default function StudyPermitIRCCPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-2xl font-semibold">
        Study Permit Application (IMM 1294)
      </h1>

      <p className="text-sm text-slate-500">
        请按 IRCC 官方表格要求填写，信息将直接用于生成 IMM1294 PDF。
      </p>

      <form
        method="post"
        action="http://localhost:5001/imm1294/submit"
        className="space-y-4"
      >
        {/* ===== Personal Details ===== */}
        <div>
          <label className="block font-medium">
            Family name (as shown on passport)
          </label>
          <input
            name="family_name"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            Given name(s)
          </label>
          <input
            name="given_name"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            Date of birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            Place of birth (City/Town)
          </label>
          <input
            name="place_of_birth"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* ===== Passport ===== */}
        <div className="pt-4 border-t">
          <label className="block font-medium">
            Passport number
          </label>
          <input
            name="passport_number"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">
            Passport expiry date
          </label>
          <input
            type="date"
            name="passport_expiry"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          生成官方 IMM1294 表格
        </button>
      </form>
    </main>
  );
}
