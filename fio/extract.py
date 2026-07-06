from docx import Document
import sys

name = sys.argv[1] if len(sys.argv) > 1 else "ensayo.docx"
doc = Document(name)
text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
out = name.replace(".docx", "_text.txt")
with open(out, "w", encoding="utf-8") as f:
    f.write(text)
print(f"Wrote {out} ({len(text)} chars)")