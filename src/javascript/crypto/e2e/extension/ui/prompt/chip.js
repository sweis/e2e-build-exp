// Copyright 2013 Google Inc. All rights reserved.
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
 * @fileoverview Provides a chip to represent PGP UIDs and passphrases
 * in the UI.
 */

goog.provide('e2e.ext.Chip');

goog.require('e2e.ext.constants');
goog.require('e2e.ext.templates.prompt');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.events.EventType');
goog.require('goog.ui.Component');
goog.require('soy');

goog.scope(function() {
var ext = e2e.ext;
var templates = e2e.ext.templates.prompt;
var constants = e2e.ext.constants;


/**
 * Constructor for the chip.
 * @param {string} value The UID or passphrase to render.
 * @param {boolean=} opt_isPassphrase If true, the provided UID is a passphrase
 *     and should be masked when displayed in the UI. Default is false.
 * @constructor
 * @extends {goog.ui.Component}
 */
ext.Chip = function(value, opt_isPassphrase) {
  goog.base(this);

  /**
   * The UID or passphrase to render.
   * @type {string}
   * @private
   */
  this.value_ = value;

  /**
   * If true, the chip is locked and cannot be removed or changed.
   * @type {boolean}
   * @private
   */
  this.isLocked_ = false;

  /**
   * If true, the value of this chip is a passphrase and should be masked when
   * displayed in the UI. Default is false.
   * @type {boolean}
   * @private
   */
  this.isPassphrase_ = Boolean(opt_isPassphrase);
};
goog.inherits(ext.Chip, goog.ui.Component);


/** @override */
ext.Chip.prototype.createDom = function() {
  this.decorateInternal(goog.dom.createElement(goog.dom.TagName.DIV));
};


/** @override */
ext.Chip.prototype.decorateInternal = function(elem) {
  this.setElementInternal(elem);

  var displayValue = this.isPassphrase() ?
      chrome.i18n.getMessage('promptPassphraseMask') : this.value_;
  soy.renderElement(elem, templates.RenderChip, {
    value: displayValue
  });
};


/** @override */
ext.Chip.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.getHandler().listen(
      this.getElement().querySelector('img'),
      goog.events.EventType.CLICK,
      this.remove);
};


/**
 * Returns the enclosed UID or passphrase.
 * @return {string} The enclosed UID or passphrase.
 */
ext.Chip.prototype.getValue = function() {
  return this.value_;
};


/**
 * Removes the current chip from the UI, if it's not locked.
 * @return {boolean} Value indicating if the chip was removed.
 */
ext.Chip.prototype.remove = function() {
  if (this.isLocked_) {
    return false;
  }
  this.getParent().removeChild(this, true);
  return true;
};


/**
 * Hides UI element that enables users to remove a chip.
 */
ext.Chip.prototype.lock = function() {
  this.isLocked_ = true;
  var img = this.getElement().querySelector('img');
  goog.dom.classes.add(img, constants.CssClass.INVISIBLE);
};


/**
 * Returns true, if chip is locked and cannot be removed or changed.
 * @return {boolean} is chip locked
 */
ext.Chip.prototype.isLocked = function() {
  return this.isLocked_;
};


/**
 * @return {boolean} True if the value of this chip is a passphrase.
 */
ext.Chip.prototype.isPassphrase = function() {
  return this.isPassphrase_;
};

}); // goog.scope
