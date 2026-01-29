from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_imm1294(data, output_path="imm1294_filled.pdf"):
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica", 10)

    c.drawString(100, height - 150, data.get("family_name", ""))
    c.drawString(100, height - 170, data.get("given_name", ""))
    c.drawString(100, height - 190, data.get("dob", ""))
    c.drawString(100, height - 210, data.get("passport", ""))

    c.showPage()
    c.save()

if __name__ == "__main__":
    sample_data = {
        "family_name": "ZHANG",
        "given_name": "SAN",
        "dob": "1990-01-01",
        "passport": "E12345678"
    }

    generate_imm1294(sample_data)
    print("IMM1294 PDF generated.")
