from pypdf import PdfReader, PdfWriter

def fill_imm1294(input_pdf, output_pdf, data: dict):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    writer.append_pages_from_reader(reader)

    # 填充 AcroForm 字段
    writer.update_page_form_field_values(
        writer.pages[0],
        {
            "family_name": data.get("family_name", ""),
            "given_name": data.get("given_name", ""),
            "date_of_birth": data.get("date_of_birth", ""),
            "place_of_birth_city": data.get("place_of_birth_city", ""),
            "place_of_birth_country": data.get("place_of_birth_country", ""),
            "gender": data.get("gender", ""),
            "marital_status": data.get("marital_status", ""),
            "passport_number": data.get("passport_number", ""),
            "passport_country": data.get("passport_country", ""),
        }
    )

    with open(output_pdf, "wb") as f:
        writer.write(f)
