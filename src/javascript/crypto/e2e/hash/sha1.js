// Copyright 2012 Google Inc. All Rights Reserved.
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
 * @fileoverview Wraps the original Sha1 implementation to conform to e2e.
 * @author evn@google.com (Eduardo Vela)
 */

goog.provide('e2e.hash.Sha1');

goog.require('e2e.hash.Algorithm');
goog.require('e2e.hash.Hash');
goog.require('e2e.hash.factory');
goog.require('goog.crypt.Sha1');



/**
 * Wrapper around the goog.crypt.Sha1 implementation.
 * @extends {e2e.hash.Hash}
 * @constructor
 */
e2e.hash.Sha1 = function() {
  goog.base(this);
  this.inst_ = new goog.crypt.Sha1();
};
goog.inherits(e2e.hash.Sha1, e2e.hash.Hash);


/** @inheritDoc */
e2e.hash.Sha1.prototype.algorithm = e2e.hash.Algorithm.SHA1;

e2e.hash.factory.add(e2e.hash.Sha1);
