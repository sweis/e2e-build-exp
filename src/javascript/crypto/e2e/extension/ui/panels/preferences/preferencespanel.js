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
 * @fileoverview Renders the list of preferences that the user has set.
 */

goog.provide('e2e.ext.ui.panels.PreferencesPanel');

goog.require('e2e.ext.constants');
goog.require('e2e.ext.ui.panels.PreferenceEntry');
goog.require('e2e.ext.ui.preferences');
goog.require('e2e.ext.ui.templates.panels.preferences');
goog.require('goog.ui.Component');
goog.require('soy');

goog.scope(function() {
var constants = e2e.ext.constants;
var panels = e2e.ext.ui.panels;
var preferences = e2e.ext.ui.preferences;
var templates = e2e.ext.ui.templates.panels.preferences;



/**
 * Constructor for the preferences list.
 * @constructor
 * @extends {goog.ui.Component}
 */
panels.PreferencesPanel = function() {
  goog.base(this);
};
goog.inherits(panels.PreferencesPanel, goog.ui.Component);


/** @override */
panels.PreferencesPanel.prototype.createDom = function() {
  goog.base(this, 'createDom');
  this.decorateInternal(this.getElement());
};


/** @override */
panels.PreferencesPanel.prototype.decorateInternal = function(elem) {
  goog.base(this, 'decorateInternal', elem);

  soy.renderElement(elem, templates.ListPreferences, {
    sectionTitle: chrome.i18n.getMessage('preferencesSectionTitle')
  });

  var prefs = [
    {
      name: constants.StorageKey.ENABLE_WELCOME_SCREEN,
      description: chrome.i18n.getMessage('preferenceWelcomeScreen'),
      setterCallback: preferences.setWelcomePageEnabled,
      isSet: preferences.isWelcomePageEnabled()
    },
    {
      name: constants.StorageKey.ENABLE_ACTION_SNIFFING,
      description: chrome.i18n.getMessage('preferenceActionSniffing'),
      setterCallback: preferences.setActionSniffingEnabled,
      isSet: preferences.isActionSniffingEnabled()
    }
  ];
  goog.array.forEach(prefs, function(pref) {
    var prefEntry = new panels.PreferenceEntry(
        pref.name, pref.description, pref.setterCallback, pref.isSet);
    this.addChild(prefEntry, true);
  }, this);
};


}); // goog.scope
