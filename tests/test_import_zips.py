import json
import tempfile
import unittest
import zipfile
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "cli"))

from import_zips import clean_name, is_font_archive, normalize, resolve_slug


class NormalizeTests(unittest.TestCase):
    def test_strips_punctuation_and_case(self):
        self.assertEqual(normalize("Cabinet Grotesk"), "cabinetgrotesk")
        self.assertEqual(normalize("azeret-mono"), "azeretmono")
        self.assertEqual(normalize("Bespoke_Sans"), "bespokesans")


class CleanNameTests(unittest.TestCase):
    def test_strips_complete_suffix(self):
        self.assertEqual(clean_name("Author_Complete"), "author")
        self.assertEqual(clean_name("Satoshi_Complete"), "satoshi")

    def test_strips_browser_duplicate_marker(self):
        self.assertEqual(clean_name("Author_Complete (1)"), "author")

    def test_strips_web_suffix(self):
        self.assertEqual(clean_name("Author_Web"), "author")


class ResolveSlugTests(unittest.TestCase):
    def _make_zip(self, tmp: Path, name: str, entries: list) -> Path:
        zip_path = tmp / name
        with zipfile.ZipFile(zip_path, "w") as zf:
            for arcname, data in entries:
                zf.writestr(arcname, data)
        return zip_path

    def test_matches_by_filename(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            zip_path = self._make_zip(
                tmp,
                "Author_Complete.zip",
                [("Author_Complete/Fonts/OTF/Author-Bold.otf", b"x")],
            )
            aliases = {"author": "author"}
            slug, reason = resolve_slug(zip_path, aliases)
            self.assertEqual(slug, "author")
            self.assertTrue(reason)

    def test_matches_by_font_stem(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            zip_path = self._make_zip(
                tmp,
                "mystery.zip",
                [("mystery/Fonts/OTF/AzeretMono-Bold.otf", b"x")],
            )
            aliases = {"azeretmono": "azeret-mono"}
            slug, reason = resolve_slug(zip_path, aliases)
            self.assertEqual(slug, "azeret-mono")

    def test_derives_slug_when_not_in_catalog(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            zip_path = self._make_zip(
                tmp,
                "BrandNew_Complete.zip",
                [("BrandNew_Complete/Fonts/OTF/BrandNew-Regular.otf", b"x")],
            )
            slug, reason = resolve_slug(zip_path, {})
            self.assertEqual(slug, "brandnew")
            self.assertIn("derived", reason)

    def test_is_font_archive(self):
        with tempfile.TemporaryDirectory() as d:
            tmp = Path(d)
            zip_path = self._make_zip(
                tmp, "fonts.zip", [("a/Fonts/OTF/A.otf", b"x")]
            )
            self.assertTrue(is_font_archive(zip_path))
            empty = self._make_zip(tmp, "empty.zip", [("readme.txt", b"x")])
            self.assertFalse(is_font_archive(empty))


if __name__ == "__main__":
    unittest.main()
