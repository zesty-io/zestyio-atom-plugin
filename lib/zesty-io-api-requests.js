'use babel';
const request = require('request').defaults({strictSSL: false})

export default class ZestyioAPIRequests {

	instancesAPIURL = "https://INSTANCE_ZUID.api.zesty.io/v1";
	instancesAPIEndpoints = {
		"modelsGET" 			: "/content/models",
		"itemsGET" 				: "/content/models/MODEL_ZUID/items",
		"viewsGET" 				: "/web/views",
		"viewGET" 				: "/web/views/VIEW_ZUID",
		"viewPOST" 				: "/web/views",
		"viewPUT" 				: "/web/views/VIEW_ZUID",
		"viewPUTPUBLISH" 	: "/web/views/VIEW_ZUID?publish=true",
		"stylesheetsGET" 	: "/web/stylesheets",
		"stylesheetPUT" 	: "/web/stylesheets/STYLESHEET_ZUID",
		"scriptsGET" 			: "/web/scripts",
		"scriptPUT" 			: "/web/scripts/SCRIPT_ZUID"
	};

	accountsAPIURL = "https://accounts.api.zesty.io/v1";
	accountsAPIEndpoints = {
		"instanceGET" : "/instances/INSTANCE_ZUID",
		"instanceUsersGET" : "/instances/INSTANCE_ZUID/users/roles"
	};

	defaultAccessError = "Request Failed";

	constructor(instanceZUID, token, options = {}) {

		if(options.hasOwnProperty('instancesAPIURL')) this.instancesAPIURL = options.instancesAPIURL;
		if(options.hasOwnProperty('accountsAPIURL')) 	this.accountsAPIURL = options.accountsAPIURL;

		this.instanceZUID = instanceZUID;
		this.token = token;
		this.makeInstancesAPIURL();


	}

	makeInstancesAPIURL(){
		this.instancesAPIURL = this.replaceInURL(
			this.instancesAPIURL,
			{'INSTANCE_ZUID':this.instanceZUID}
		);
	}
	buildAPIURL(uri, api = "instances"){
		return (api == "accounts") ? this.accountsAPIURL + uri : this.instancesAPIURL + uri;
	}

	replaceInURL(url, replacementObject){
		for (var key in replacementObject) {
			url = url.replace(key, replacementObject[key])
		}
		return url
	}

	async getModels(){
		let modelsURL =  this.buildAPIURL(this.instancesAPIEndpoints.modelsGET);
		return await this.getRequest(modelsURL);
	}

	async getItems(modelZUID){
		let itemsURL = this.buildAPIURL(
			this.replaceInURL(
				this.instancesAPIEndpoints.itemsGET,
				{'MODEL_ZUID':modelZUID})
			);
		return await this.getRequest(itemsURL);

	}

	async getViews(){
		return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.viewsGET));
	}

	async putView(viewZUID, payload){
		let viewPutURL = this.replaceInURL(
			this.buildAPIURL(this.accountsAPIEndpoints.viewPUT),
			{'VIEW_ZUID': viewZUID}
		);
		return await this.putRequest(viewPutURL, payload);
	}

	async getScripts(){
		return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.scriptsGET));
	}

	async putScript(scriptZUID, payload){
		let scriptPutURL = this.replaceInURL(
			this.buildAPIURL(this.accountsAPIEndpoints.scriptPUT),
			{'SCRIPT_ZUID': scriptZUID}
		);
		return await this.putRequest(scriptPutURL, payload);
	}

	async getStylesheets(){
		return await this.getRequest(this.buildAPIURL(this.instancesAPIEndpoints.stylesheetsGET));
	}

	async putStylesheet(stylesheetZUID, payload){
		let stylesheetPutURL = this.replaceInURL(
			this.buildAPIURL(this.accountsAPIEndpoints.stylesheetPUT),
			{'STYLESHEET_ZUID': stylesheetZUID}
		);
		return await this.putRequest(stylesheetPutURL, payload);
	}

	async getInstance(){
		let instanceGETURL = this.replaceInURL(
			this.buildAPIURL(this.accountsAPIEndpoints.instanceGET, "accounts"),
			{'INSTANCE_ZUID': this.instanceZUID}
		);
		return await this.getRequest(instanceGETURL);
	}

	async getInstanceUsers(){
		let instanceUsersAPIURL = this.replaceInURL(
			this.buildAPIURL(this.accountsAPIEndpoints.instanceUsersGET,"accounts"),
			{'INSTANCE_ZUID':this.instanceZUID}
		);
		return await this.getRequest(instanceUsersAPIURL);

	}

	async getRequest(url) {
		$this = this
		return new Promise((resolve, reject) => {
			request.get(url, {
				'auth': {
					'bearer': $this.token
				}
			}, (error, response, body) => {
				body = JSON.parse(body);
				if (!error && response.statusCode == 200) {
					resolve(body)
				} else {
					console.log(error)
					reject({
						reason: $this.defaultAccessError + ': ' + body.error
					})
				}
			})
		})
	}

	async putRequest(url, payload) {
		$this = this
    return new Promise((resolve, reject) => {
      request.put({
				'url' : url,
				'body': JSON.stringify(payload),
			  'auth': {
			    'bearer': $this.token
			  }
			}, (error, response, body) => {

				body = JSON.parse(body);
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: $this.defaultAccessError + ': ' + body.error
          })
        }
      })
    })
  }


	async postRequest(url,payload) {
		$this = this
		return new Promise((resolve, reject) => {
			request.post({
				'url' : url,
				'body': JSON.stringify(payload),
			  'auth': {
			    'bearer': $this.token
			  }
			}, (error, response, body) => {
				body = JSON.parse(body);
				if (!error && response.statusCode == 201) {
					resolve(body)
				} else {
          reject({
						reason: $this.defaultAccessError + ': ' + body.error
					})
				}
			})
		})
	}

}