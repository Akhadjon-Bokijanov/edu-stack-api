const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const redisUrl = 'redis://127.0.0.1:6379';

const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(key) {
	this._cacheKey = key;
	this._useCache = true;
	return this;
}

mongoose.Query.prototype.exec = async function() {
	if(!this._useCache) {
		return exec.apply(this, arguments);
	}
	
	const cache = await client.get(this._cacheKey);
	if(cache) {
		return JSON.parse(cache);
	}

	const res = await exec.apply(this, arguments);

	/*
	 *    Two more arguments should be added
	 *	  before deploying ('EX', numberOfSeconds)
	 *	  Windows doesn't support those arguments :/
	 */
	client.set(this._cacheKey, JSON.stringify(res));
	return res;
};

module.exports = { 
	clearCache(key) {
		for(let i = 0; i < key.length; i++) {
			client.del(key[i]);
		}
		console.log('cache cleared');
	}
};
