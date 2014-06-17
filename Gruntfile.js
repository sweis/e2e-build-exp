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
  grunt.initConfig({
    shell: {
      buildScript: {
        options: {},
        command: function(target) {
          if (target.match(/^[-a-z_]+$/)) {
            return 'bash ./build.sh ' + target;
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('build-extension', [
    'shell:buildScript:extension'
  ]);

  grunt.registerTask('check-deps', [
    'shell:buildScript:check_deps'
  ]);

  grunt.registerTask('install-deps', [
    'shell:buildScript:install_deps'
  ]);

  grunt.registerTask('clean', [
    'shell:buildScript:clean'
  ]);

  grunt.registerTask('default', [
    'build-extension'
  ]);
};
