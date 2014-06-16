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
 * @fileoverview Renders the welcome page of the extension.
 */

goog.provide('e2e.ext.ui.Welcome');

goog.require('e2e.cipher.Algorithm');
goog.require('e2e.ext.constants');
goog.require('e2e.ext.messages');
goog.require('e2e.ext.ui.Dialog');
goog.require('e2e.ext.ui.panels.GenerateKey');
goog.require('e2e.ext.ui.panels.KeyringMgmtMini');
goog.require('e2e.ext.ui.preferences');
goog.require('e2e.ext.ui.templates.welcome');
goog.require('e2e.ext.utils');
goog.require('e2e.openpgp.ContextImpl');
goog.require('e2e.signer.Algorithm');
goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.object');
goog.require('goog.ui.Component');
goog.require('goog.ui.Zippy');
goog.require('goog.ui.Zippy.Events');
goog.require('soy');

goog.scope(function() {
var ui = e2e.ext.ui;
var constants = e2e.ext.constants;
var preferences = ui.preferences;
var templates = ui.templates.welcome;
var utils = e2e.ext.utils;



/**
 * Constructor for the welcome page.
 * @constructor
 * @extends {goog.ui.Component}
 */
ui.Welcome = function() {
  goog.base(this);
};
goog.inherits(ui.Welcome, goog.ui.Component);


/**
 * The form where novice users can add their email address to get set up.
 * @type {ui.panels.GenerateKey}
 * @private
 */
ui.Welcome.prototype.genKeyForm_ = null;


/**
 * A component to let the user set up the extension's keyring.
 * @type {ui.panels.KeyringMgmtMini}
 * @private
 */
ui.Welcome.prototype.keyringMgmt_ = null;


/** @override */
ui.Welcome.prototype.decorateInternal = function(elem) {
  goog.base(this, 'decorateInternal', elem);

  var basicsSection = {
    title: chrome.i18n.getMessage('welcomeBasicsTitle'),
    subsections: [
      {text: chrome.i18n.getMessage('welcomeBasicsLine1')},
      {
        text: chrome.i18n.getMessage('welcomeBasicsLine2'),
        header: true
      },
      {iframe: {
        src: chrome.i18n.getMessage('welcomeIframeUrl'),
        height: '400',
        width: '100%'
      }},
      {
        text: chrome.i18n.getMessage('welcomeBasicsLine3')
      }
    ]
  };

  var noviceSection = {
    title: chrome.i18n.getMessage('welcomeNoviceTitle'),
    subsections: []
  };

  var advancedSection = {
    title: chrome.i18n.getMessage('welcomeAdvancedTitle'),
    subsections: []
  };

  soy.renderElement(elem, templates.Welcome, {
    extName: chrome.i18n.getMessage('extName'),
    headerText: chrome.i18n.getMessage('welcomeHeader'),
    basicsSection: basicsSection,
    noviceSection: noviceSection,
    advancedSection: advancedSection,
    preferenceLabel: chrome.i18n.getMessage('preferenceWelcomeScreen'),
    actionButtonTitle: chrome.i18n.getMessage('welcomeAcceptanceButton')
  });

  var styles = elem.querySelector('link');
  styles.href = chrome.extension.getURL('welcome_styles.css');

  this.getContext_(goog.bind(function(pgpCtx) {
    pgpCtx.getAllKeys(true).addCallback(goog.bind(function(keys) {
      if (!goog.object.isEmpty(keys)) {
        this.hideKeyringSetup_();
      } else {
        this.genKeyForm_ = new ui.panels.GenerateKey(
            goog.bind(this.generateKey_, this), true);
        this.addChild(this.genKeyForm_, false);
        this.genKeyForm_.render(
            goog.dom.getElement(constants.ElementId.WELCOME_CONTENT_NOVICE));

        this.keyringMgmt_ = new ui.panels.KeyringMgmtMini(
            goog.nullFunction,
            goog.bind(this.importKeyring_, this),
            goog.bind(this.updateKeyringPassphrase_, this));
        this.addChild(this.keyringMgmt_, false);
        this.keyringMgmt_.render(
            goog.dom.getElement(constants.ElementId.WELCOME_CONTENT_ADVANCED));
      }
    }, this));
  }, this));
};


/** @override */
ui.Welcome.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var footer = goog.dom.getElement(constants.ElementId.WELCOME_FOOTER);
  this.getHandler().listen(
      goog.dom.getElementByClass(constants.CssClass.ACTION, footer),
      goog.events.EventType.CLICK, this.closeAndDisableWelcomeScreen_);
};


/**
 * Closes and disables the welcome page.
 * @private
 */
ui.Welcome.prototype.closeAndDisableWelcomeScreen_ = function() {
  var checkbox = this.getElement().querySelector('input');
  preferences.setWelcomePageEnabled(checkbox.checked);
  window.close();
};


/**
 * Generates a new PGP key using the information that is provided by the user.
 * @param {ui.panels.GenerateKey} panel The panel where the user has provided
 *     the information for the new key.
 * @param {string} name The name to use.
 * @param {string} email The email to use.
 * @param {string} comments The comments to use.
 * @param {number} expDate The expiration date to use.
 * @return {goog.async.Deferred}
 * @private
 */
ui.Welcome.prototype.generateKey_ =
    function(panel, name, email, comments, expDate) {
  var keyAlgo = e2e.signer.Algorithm['ECDSA'];
  var keyLength = 256;

  var subkeyAlgo = e2e.cipher.Algorithm['ECDH'];
  var subkeyLength = 256;

  var welcomePage = this;
  var anchorElem = this.genKeyForm_;
  this.getContext_(goog.bind(function(pgpCtx) {
    if (pgpCtx.isKeyRingEncrypted()) {
      window.alert(chrome.i18n.getMessage('settingsKeyringLockedError'));
    }

    pgpCtx.generateKey(keyAlgo, keyLength, subkeyAlgo, subkeyLength, name,
        comments, email, expDate).addCallback(goog.bind(function(key) {
      var dialog = new ui.Dialog(
          chrome.i18n.getMessage('welcomeGenKeyConfirm'),
          this.hideKeyringSetup_,
          ui.Dialog.InputType.NONE);
      this.removeChild(this.genKeyForm_, false);
      this.addChild(dialog, false);
      dialog.decorate(this.genKeyForm_.getElement());
      panel.reset();
    }, this));

  }, this));
};


/**
 * Imports a keyring from a file and appends it to the current keyring.
 * @param {File} file The file to import.
 * @private
 */
ui.Welcome.prototype.importKeyring_ = function(file) {
  utils.ReadFile(file, goog.bind(function(contents) {
    this.getContext_(goog.bind(function(pgpCtx) {
      // TODO(adhintz) try/catch here to alert on failed key import?
      var keyDescription = pgpCtx.getKeyDescription(contents);
      // TODO(evn): All these messages should be localized.
      if (window.confirm('Do you want to import the following keys?\n\n' +
          keyDescription)) {
        pgpCtx
            .importKey(
                goog.bind(this.renderPassphraseCallback_, this), contents)
            .addCallback(goog.bind(function(res) {
              var dialog = new ui.Dialog(
                  chrome.i18n.getMessage('welcomeKeyImport'),
                  this.hideKeyringSetup_,
                  ui.Dialog.InputType.NONE);
              this.removeChild(this.keyringMgmt_, false);
              this.addChild(dialog, false);
              dialog.decorate(this.keyringMgmt_.getElement());
            }, this));
      }
    }, this));
  }, this));
};


/**
 * Updates the passphrase to the existing keyring.
 * @param {string} passphrase The new passphrase to apply.
 * @private
 */
ui.Welcome.prototype.updateKeyringPassphrase_ = function(passphrase) {
  this.getContext_(goog.bind(function(pgpCtx) {
    pgpCtx.changeKeyRingPassphrase(passphrase);

    var dialog = new ui.Dialog(
        chrome.i18n.getMessage('keyMgmtChangePassphraseSuccessMsg'),
        goog.bind(function() {
        this.removeChild(dialog, false);
          this.keyringMgmt_ = new ui.panels.KeyringMgmtMini(
              goog.nullFunction,
              goog.bind(this.importKeyring_, this),
              goog.bind(this.updateKeyringPassphrase_, this));
          this.addChild(this.keyringMgmt_, false);
          this.keyringMgmt_.decorate(dialog.getElement());
          this.keyringMgmt_.setKeyringEncrypted(pgpCtx.isKeyRingEncrypted());
        }, this),
        ui.Dialog.InputType.NONE);
    this.removeChild(this.keyringMgmt_, false);
    this.addChild(dialog, false);
    dialog.decorate(this.keyringMgmt_.getElement());
  }, this));
};


/**
 * Renders the UI elements needed for requesting the passphrase of an individual
 * PGP key.
 * @param {string} uid The UID of the PGP key.
 * @param {!function(string)} callback The callback to invoke when the
 *     passphrase has been provided.
 * @private
 */
ui.Welcome.prototype.renderPassphraseCallback_ = function(uid, callback) {
  var popupElem = goog.dom.getElement(constants.ElementId.CALLBACK_DIALOG);
  var dialog = new ui.Dialog(
      goog.string.format(
          chrome.i18n.getMessage('promptPassphraseCallbackMessage'), uid),
      function(passphrase) {
        goog.dispose(dialog);
        callback(/** @type {string} */ (passphrase));
      },
      // Use a password field to ask for the passphrase.
      ui.Dialog.InputType.SECURE_TEXT,
      '',
      chrome.i18n.getMessage('actionEnterPassphrase'),
      chrome.i18n.getMessage('actionCancelPgpAction'));

  this.addChild(dialog, false);
  dialog.render(popupElem);
};


/**
 * Hides the UI for setting up the keyring.
 * @private
 */
ui.Welcome.prototype.hideKeyringSetup_ = function() {
  var elements = [
    goog.dom.getElement(constants.ElementId.WELCOME_MENU_NOVICE),
    goog.dom.getElement(constants.ElementId.WELCOME_MENU_ADVANCED)
  ];

  goog.array.forEach(elements, function(elem) {
    elem.parentElement.removeChild(elem);
  });
};


/**
 * Gets the PGP context.
 * @param {!function(e2e.openpgp.ContextImpl)} callback The callback where
 *     the PGP context is to be passed.
 * @private
 */
ui.Welcome.prototype.getContext_ = function(callback) {
  chrome.runtime.getBackgroundPage(goog.bind(function(backgroundPage) {
    if (backgroundPage) {
      callback(
          /** @type {!e2e.openpgp.ContextImpl} */
          (backgroundPage.launcher.getContext()));
    } else {
      console.error(chrome.runtime.lastError);
    }
  }, this));

};

}); // goog.scope


// Create the welcome page.
if (Boolean(chrome.extension)) {
  var welcomePage = new e2e.ext.ui.Welcome();
  welcomePage.decorate(document.documentElement);
}
