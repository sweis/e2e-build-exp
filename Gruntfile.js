// Copyright 2014 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Gruntfile for building End-To-End targets
 *
 * @author koto@google.com (Krzysztof Kotowicz)
 */
module.exports = function(grunt) {

  var CLOSURE_SRC_DIRS = [
          'src',
          'lib/closure-library',
          'lib/closure-templates/javascript',
          'lib/zlib.js/src',
          'lib/typedarray'
  ];

  var BUILD_EXT_DIR = 'build/extension';

  grunt.initConfig({
    closureBuilder:  {
      options: {
        closureLibraryPath: 'lib/closure-library', // path to closure library
        compilerFile: 'lib/closure-compiler/compiler.jar',
        compile: true,
        compilerOpts: {
        },
        execOpts: {
           maxBuffer: 999999 * 1024
        }
      },
      extension_launcher: {
        src: CLOSURE_SRC_DIRS,
        dest: BUILD_EXT_DIR + '/launcher_binary.js',
        options: {
          inputs: 'src/javascript/crypto/e2e/extension/bootstrap.js'
        }
      },
      extension_helper: {
        src: CLOSURE_SRC_DIRS,
        dest: BUILD_EXT_DIR + '/helper_binary.js',
        options: {
          inputs: 'src/javascript/crypto/e2e/extension/helper/helper.js'
        }
      },
      extension_glass: {
        src: CLOSURE_SRC_DIRS,
        dest: BUILD_EXT_DIR + '/glass_binary.js',
        options: {
          inputs: 'src/javascript/crypto/e2e/extension/ui/glass/bootstrap.js'
        }
      },
      extension_settings: {
        src: CLOSURE_SRC_DIRS,
        dest: BUILD_EXT_DIR + '/settings_binary.js',
        options: {
          inputs: 'src/javascript/crypto/e2e/extension/ui/settings/settings.js'
        }
      },
      extension_prompt: {
        src: CLOSURE_SRC_DIRS,
        dest: BUILD_EXT_DIR + '/prompt_binary.js',
        options: {
          inputs: 'src/javascript/crypto/e2e/extension/ui/prompt/prompt.js'
        }
      },
      extension_welcome: {
        src: CLOSURE_SRC_DIRS,
        dest: BUILD_EXT_DIR + '/welcome_binary.js',
        options: {
          inputs: 'src/javascript/crypto/e2e/extension/ui/welcome/welcome.js'
        }
      }
    },
    copy: {
      extension_files: {
        files: [
          {
            expand: true,
            cwd: 'src/javascript/crypto/e2e/extension',
            src: [
              'images/**',
              '_locales/**',
            ],
            dest: BUILD_EXT_DIR
          },
          {
             expand: true,
             flatten: true,
             cwd: 'src/javascript/crypto/e2e/extension',
             src: [
              'ui/**/*.html',
              'helper/gmonkeystub.js',
              'manifest.json',
             ], dest: BUILD_EXT_DIR,
          }
        ]
      }
    },
    shell: {
      cssCompile: {
        options: {
          stderr: false
        },
        command: function(name) {
          if (name.match(/^[a-z_]+$/)) {
            return 'java -jar lib/closure-stylesheets-20111230.jar ' +
            'src/javascript/crypto/e2e/extension/ui/styles/base.css ' +
            'src/javascript/crypto/e2e/extension/ui/' + name + '/' + name +
                '.css ' +
            '-o ' + BUILD_EXT_DIR + '/' + name + '_styles.css';
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', [
    'closureBuilder',
    'shell:cssCompile:glass',
    'shell:cssCompile:prompt',
    'shell:cssCompile:settings',
    'shell:cssCompile:welcome',
    'copy:extension_files'
  ]);

};
