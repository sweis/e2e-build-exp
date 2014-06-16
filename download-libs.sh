#!/bin/bash
# // Copyright 2014 Google Inc. All rights reserved.
# //
# // Licensed under the Apache License, Version 2.0 (the "License");
# // you may not use this file except in compliance with the License.
# // You may obtain a copy of the License at
# //
# //   http://www.apache.org/licenses/LICENSE-2.0
# //
# // Unless required by applicable law or agreed to in writing, software
# // distributed under the License is distributed on an "AS IS" BASIS,
# // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# // See the License for the specific language governing permissions and
# // limitations under the License.
# /**
#  * @fileoverview Shell script to download End-To-End build dependencies
#  *
#  * @author koto@google.com (Krzysztof Kotowicz)
#  */

cd lib

# checkout closure library
git clone https://github.com/google/closure-library/ closure-library

# checkout closure templates
svn checkout https://closure-templates.googlecode.com/svn/trunk/ closure-templates

# checkout zlib.js
git clone https://github.com/imaya/zlib.js zlib.js
mkdir typedarray
ln -s ../zlib.js/define/typedarray/use.js typedarray/use.js

# checkout js compiler
curl https://dl.google.com/closure-compiler/compiler-latest.zip -O # -k --ssl-added-and-removed-here-;-)
unzip compiler-latest.zip -d closure-compiler
rm compiler-latest.zip

# checkout css compiler
curl https://closure-stylesheets.googlecode.com/files/closure-stylesheets-20111230.jar -O

cd ..
