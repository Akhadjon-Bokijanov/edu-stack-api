function bSearch(array, value) {
	let begin = 0;
	let end = array.length - 1;
	let mid = (begin + end) / 2;
	while(begin <= end) {
		mid = (begin + end) / 2;
		if(value === array[mid]) {
			return true;
		}
		else if(value > array[mid]) {
			begin = mid;
		}
		else {
			end = mid;
		}
	}
	return false;	
}

module.exports = {
	bSearch: bSearch
}