/**
 * @author brodydoescode
 */

var Util = (function () {
	"use strict";

	var Util = function () {
		throw "Util cannot be instantiated.";
	};

	Util.hasCSSClass = function (ele, cls) {
		if (ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) {
			return true;
		}
		return false;
	};

	Util.addCSSClass = function (ele, cls) {
	    if (typeof cls !== "string") {
	        throw "Util.addCSSClass cls input must be a string";
	    }

		if (Util.hasCSSClass(ele, cls)) {
			return;
		}

		ele.className += " " + cls;
	};

	Util.removeCSSClass = function (ele, cls) {
		if (Util.hasCSSClass(ele, cls)) {
			var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
			ele.className = ele.className.replace(reg, " ");
		}
	};

	Util.isEmpty = function (obj) {
		var h;
		for (h in obj) {
			if (obj.hasOwnProperty(h)) {
				return false;
			}
		}
		return true;
	};

	return Util;

}());