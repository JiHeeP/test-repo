from pathlib import Path
files = [
    'tmp/Literacy-Grade-5-–-The-Art-of-Fantasy-How-To-Create-a-World-of-Make-Believe.txt',
    'tmp/Literacy-–-Grade-1_-Me-and-My-Family_-Stories-to-Learn-About-Each-Other.txt',
    'tmp/Science-Early-Years-Sharing-the-Planet-Living-Things-Big-and-Small.txt'
]
for fp in files:
    print('\n====', Path(fp).name, '====')
    lines = Path(fp).read_text(encoding='utf-8').splitlines()
    for i, l in enumerate(lines, 1):
        t = l.strip()
        low = t.lower()
        if any(k in low for k in [
            'concept-based curriculum unit',
            'unit title:',
            'conceptual lens:',
            'grade level:',
            'unit overview',
            'notes for teachers',
            'standards:',
            'unit web',
            'generalizations and guiding questions',
            'knowledge and skills',
            'assessment',
            'summative assessment task',
            'pre-assessment task',
            'learning experiences',
            'teacher reflection',
            'scoring guide',
            'learning map',
            'unit author',
        ]) or t.isupper() and len(t.split()) < 8:
            if len(t) > 0 and len(t) < 180:
                print(f"{i:4}: {t}")
