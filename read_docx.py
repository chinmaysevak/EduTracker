import xml.etree.ElementTree as ET
try:
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tree = ET.parse('format_unzipped/word/document.xml')
    root = tree.getroot()
    text = []
    for para in root.iter(f"{{ns['w']}}p"):
        para_text = ''.join(node.text for node in para.iter(f"{{ns['w']}}t") if node.text)
        if para_text:
            text.append(para_text)
    print('\n'.join(text))
except Exception as e:
    print('Error:', e)
