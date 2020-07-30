function setHeaders(req, res, next) {
	return function(req, res, next) {
				res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
				res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
				res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
				next();
			}
}


module.exports = setHeaders;