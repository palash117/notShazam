var recognize = (blob, callBack) => {
	var myHeaders = new Headers();
	// myHeaders.append("api_token", "774a8e688bc5a445acca2aeee37295de");
	// myHeaders.append(
	// 	"Cookie",
	// 	"__cfduid=dc380c36c115d45754be9ac9d807fa75b1593100728"
	// );

	var formdata = new FormData();
	formdata.append("return", "lyrics,timecode");
	formdata.append("file", blob);

	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: formdata,
		redirect: "follow",
		mode: "cors",
	};

	fetch("https://api.audd.io/?api_token=test", requestOptions)
		.then((response) => {
			console.log(response);
			return response.json();
		})
		.then((result) => {
			console.log(result);
			callBack(result);
		})
		.catch((error) => {
			console.log("error", error);
			callBack(null);
		});
};
module.exports = recognize;
