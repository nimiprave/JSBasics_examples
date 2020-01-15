/**
 * setting the language must be done before UI5 bootstrap is loaded
 * method readUserData from /CUAN_SHELL_LIB/ShellProvider.js cannot be used, as AppCacheBuster can only be used after UI5 bootstrap
 * Therefore user data are read directly, but keep window.sap.hpa.oUserData in synch with method readUserData
 */
window.sap = window.sap || {};
window.sap.hpa = window.sap.hpa || {};
window.sap.hpa.CUAN_SHELL_CACHE_PAGES = "CUAN_SHELL_CACHE_PAGES";
window.sap.hpa.CUAN_SHELL_CACHE_USERS = "CUAN_SHELL_CACHE_USERS";
window.sap.hpa.CUAN_SHELL_CACHE_NAV_TREE = "CUAN_SHELL_CACHE_NAV_TREE";

// ensure that even encoded URL are handled
var sURLOrg = document.location;
var sURLDecoded = decodeURIComponent(document.location);
if (sURLOrg != sURLDecoded) {
	document.location.assign(sURLDecoded);
}

var fnGetUrlParameter = function (inParam, bOpener) {
	var searchString = window.location.search.substring(1);
	if (bOpener === true && window.opener != undefined && window.opener != null) {
		try {
			searchString = window.opener.location.search.substring(1);
		} catch (e) {}
	}
	var aParams = searchString.split("&");
	var i, val;
	for (i = 0; i < aParams.length; i++) {
		val = aParams[i].split("=");
		if (val[0] == inParam) {
			return val[1];
		}
	}
	return null;
};

// get the URL parameter edithelp=true from calling application and 
// enhance the current URL
var sEditHelpParamSource = fnGetUrlParameter("edithelp", true);
var sEditHelpParamTarget = fnGetUrlParameter("edithelp");

if (sEditHelpParamSource === "true" && sEditHelpParamTarget !== "true") {
	var sURLEnhanced = sURLDecoded.replace("?", "?edithelp=true&");
	document.location.assign(sURLEnhanced);
}

var fnGetPersCacheId = function (sPageId) {
	if (window.sap.hpa.oStartupInfo) {
		var i;
		for (i in window.sap.hpa.oStartupInfo) {
			if (window.sap.hpa.oStartupInfo[i].ID == sPageId) {
				return window.sap.hpa.oStartupInfo[i].CacheId;
			}
		}
	}
	return null;
};

var fnSuccess = function (data) {
	if (data) {
		window.sap.hpa.oUserData = data.results[0];
		var sLanguage = data.results[0].Language;

		if (sLanguage.toUpperCase() === "ZH") {
			sLanguage = "zh_CN";
		} else if (sLanguage.toUpperCase() === "1Q") {
			sLanguage = "en-US-x-saptrc";
		} else if (sLanguage.toUpperCase() === "2Q") {
			sLanguage = "en-US-x-sappsd";
		}

		window["sap-ui-config"] = window["sap-ui-config"] || {};
		window["sap-ui-config"].language = sLanguage;
		window.sap.hpa.oUserData.Language = sLanguage;

	}
};

var fnStartupInfosSuccess = function (data) {
	if (data) {
		window.sap.hpa.oStartupInfo = data.results;
	}
};

var fnUserSettingsSuccess = function (oResult) {

	var isAppBlacklisted = function (inAppName) {
		//black list for custom theme
		var bBlacklisted = false;
		var aBlacklist = ['SEGMENTATIONMODELS',
			'SEGMENTATION',
			'SEG_VIEWER',
			'SEGMODEL',
			'SEG_BB_LIST',
			'SEG_BB',
			'SEGBB',
			'PRODRECO',
			'PRODRECOTYPE',
			'TARGETGROUPS',
			'TARGETGROUP_TI',
			'SENTIMENTANALYTICS',
			'SE',
			'PRED_MODEL_FIT_TI',
			'PRED_MODEL_SUCCESS_TI',
			'EXPORTDEFINITIONS',
			'PRED_MODEL_CAMPAIGNS'
		];
		for (i in aBlacklist) {
			if (inAppName.indexOf(aBlacklist[i]) >= 0) {
				bBlacklisted = true;
			}
		};
		return bBlacklisted;
	};

	if (oResult && typeof oResult.Theme !== "undefined" && oResult.Theme !== "") {
		if (oResult.Theme === "sap_belize_plus") {
			oResult.Theme = "sap_belize";
		}
		// set sap_belize if application is blacklisted		
		if (isAppBlacklisted(document.location.hash)) {
			oResult.Theme = "sap_belize";
		}
		window["sap-ui-config"].theme = oResult.Theme;

		if (oResult.Theme.search("sap") !== 0) {
			var sThemeRoot = "/sap/public/bc/themes/~client-" + window.sap.hpa.oUserData.SystemInfo.SystemClient;
			if (window.sap.hpa.oUserData.FLPThemeRoot !== undefined && window.sap.hpa.oUserData.FLPThemeRoot !== "") {
				sThemeRoot = window.sap.hpa.oUserData.FLPThemeRoot;
			}
			window["sap-ui-config"].themeRoots = window["sap-ui-config"].themeRoots || {};
			window["sap-ui-config"].themeRoots[oResult.Theme] = sThemeRoot + "/UI5";
		}
	}
	if (typeof window["sap-ui-config"].theme === "undefined") {
		window["sap-ui-config"].theme = "sap_bluecrystal";
	}
	window.sap.hpa.oUserData.FLPTheme = window["sap-ui-config"].theme;

};

window.sap.hpa.childof = window.sap.hpa.childof || {};
if (window.opener !== undefined && window.opener !== null) {
	try {
		window.opener.sap !== undefined;
		var data1 = {},
			data2 = {
				value: ""
			},
			data3 = {};
		data1.results = [window.opener.sap.hpa.oUserData];
		data2.Theme = window.opener.sap.hpa.oUserData.FLPTheme;
		// 	data2.RTL = window.opener.sap.hpa.oUserData.RTL;
		fnSuccess(data1);
		fnUserSettingsSuccess(data2);
		if (window.opener.sap.hpa.oStartupInfo) {
			data3.results = window.opener.sap.hpa.oStartupInfo;
			fnStartupInfosSuccess(data3);
		}

		window.sap.hpa.childof = true;
	} catch (e) {}
}

if (window.sap.hpa.childof !== true) {
	var bCache = fnGetUrlParameter("sap-hpa-cache");
	if (bCache !== "false") {
		OData.read({
				requestUri: "/sap/opu/odata/sap/CUAN_NWBC_USER_INFO_SRV/StartupInfos",
				async: false,
				/*    cache : true */
				headers: {
					"cache-control": "max-age=604800"
				}
			},
			fnStartupInfosSuccess,
			function (oError) {
				if (console.error) {
					console.error(oError);
				}
			});
	}

	var sRequestUri =
		"/sap/opu/odata/sap/CUAN_NWBC_USER_INFO_SRV/NWBCUsers?$expand=Authorizations,MarketingAreas,SystemInfo,HelpContextIds,TargetMappings"
	if (window.sap.hpa.oStartupInfo) {
		var sPersCacheId = fnGetPersCacheId(window.sap.hpa.CUAN_SHELL_CACHE_USERS);
		if (sPersCacheId) {
			sRequestUri = sRequestUri + "&sap-cache-id=" + sPersCacheId;
		}
	}

	OData.read({
			requestUri: sRequestUri,
			async: false,
			/*    cache : true */
			headers: {
				"cache-control": "max-age=604800"
			}
		},
		fnSuccess,
		function (oError) {
			if (console.error) {
				console.error(oError);
			}
		});

	var sTheme = fnGetUrlParameter("sap-theme");

	var dataTheme = {};
	dataTheme["Theme"] = "";

	if (sTheme) {
		window["sap-ui-config"].theme = sTheme;
		dataTheme["Theme"] = sTheme;

	} else {
		dataTheme["Theme"] = window.sap.hpa.oUserData.FLPTheme;
	}
	fnUserSettingsSuccess(dataTheme);
}

window["sap-ui-config"].bindingSyntax = "complex";