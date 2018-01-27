rem require 7-zip (http://www.7-zip.org/)
del release\release.zip
7z a release\release.zip manifest.json _locales css html image js 