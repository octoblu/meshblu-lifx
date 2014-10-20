'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var lifx = require('lifx');
var tinycolor = require('tinycolor2');

var UINT16_MAX = 65535;
var MAX_KELVIN = 9000;

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    bulbName: {
      type: 'string,array',
      required: false
    },
    on: {
      type: 'boolean'
    },
    color: {
      type: 'string'
    },
    timing: {
      type: 'number'
    },
    white: {
      type: 'number'
    }
  }
};

var OPTIONS_SCHEMA = {};

function Plugin(){
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;
  this.updateLifx(payload);
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
  this._lifx = undefined;

  this.setupLifx();
};

Plugin.prototype.setupLifx = function() {
  this._lifx = lifx.init();
}

Plugin.prototype.updateLifx = function(payload) {
  var hsv, hue, sat, bri, temp, bulb;
  hsv   = tinycolor(payload.color).toHsv();
  hue   = parseInt(hsv.h * 360 * UINT16_MAX);
  sat   = parseInt(hsv.s * UINT16_MAX);
  bri   = parseInt(hsv.v * UINT16_MAX);
  temp = parseInt(hsv.a * MAX_KELVIN);
  bulb  = payload.bulbName;

  if (payload.on) {
    this._lifx.lightsOn(bulb);
    this._lifx.lightsColour(hue, sat, bri, temp, payload.timing, bulb);
  } else {
    this._lifx.lightsOff(bulb);
  }
}

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
