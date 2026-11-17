import tempfile
import unittest
import zipfile
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "cli"))

from archive import extract_family_zip


class ExtractTests(unittest.TestCase):
    def _make_zip(self, tmp: Path, entries: dict) -> Path:
        zip_path = tmp / "family.zip"
        with zipfile.ZipFile(zip_path, "w") as zf:
            for arcname, data in entries.items():
                zf.writestr(arcname, data)
        return zip_path

    def test_strips_root_and_fonts_dir(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            zip_path = self._make_zip(
                tmp,
                {
                    "Family_Complete/Fonts/OTF/F-Bold.otf": b"bold",
                    "Family_Complete/Fonts/TTF/F-Variable.ttf": b"var",
                },
            )
            out = tmp / "out" / "family"
            count = extract_family_zip(zip_path, out)
            self.assertEqual(count, 2)
            self.assertTrue((out / "OTF" / "F-Bold.otf").is_file())
            self.assertTrue((out / "TTF" / "F-Variable.ttf").is_file())

    def test_rejects_zip_slip(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            zip_path = tmp / "slip.zip"
            with zipfile.ZipFile(zip_path, "w") as zf:
                zf.writestr("Family_Complete/../../evil.txt", b"pwned")
                zf.writestr("Family_Complete/Fonts/OTF/ok.otf", b"ok")
            out = tmp / "out" / "family"
            extract_family_zip(zip_path, out)
            # The traversal entry must not have escaped the staging dir.
            self.assertFalse((tmp / "evil.txt").exists())
            self.assertTrue((out / "OTF" / "ok.otf").is_file())

    def test_atomic_replace(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            out = tmp / "out" / "family"
            out.mkdir(parents=True)
            (out / "old.otf").write_bytes(b"old")
            zip_path = self._make_zip(tmp, {"Family/Fonts/OTF/new.otf": b"new"})
            extract_family_zip(zip_path, out)
            self.assertFalse((out / "old.otf").exists())
            self.assertTrue((out / "OTF" / "new.otf").is_file())


if __name__ == "__main__":
    unittest.main()
