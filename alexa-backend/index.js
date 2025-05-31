const express = require("express");
const app = express();
const { query, oneOf, validationResult, header } = require('express-validator');
const ytdl = require("@distube/ytdl-core");
const ytsr = require("@distube/ytsr");
const fs = require("fs");
const { uuidv7 } = require("uuidv7");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// configuration
// baseURL requires https
const baseURL = "https://alexa-youtube.cafe-setaria.net";
const port = 3200;
const fileStorePath = "./filestore";
const jwtcfg = {
	secret: 'secret_key_goes_here',
	options: {
		algorithm: 'HS256',
		//expiresIn: '10m'
	}
};

class User {
	constructor(token) {
		this.token = token;
		try {
			this.userInfo = jwt.verify(token, jwtcfg.secret);
			if (!this.userInfo.userid.match(/^[A-Za-z0-9]*$/)) {
				this.userInfo = null;
			}
		} catch (e) {
			this.userInfo = null;
		}
	}

	addFavorite(url, title, thumbnail) {
		if (fs.existsSync(fileStorePath + "/" + this.userInfo.userid + ".json")) {
			const data = JSON.parse(fs.readFileSync(fileStorePath + "/" + this.userInfo.userid + ".json"));
			if (data.favorites.find((e) => e.url === url)) return false;
			data.favorites.unshift({url: url, title: title, thumbnail: thumbnail});
			fs.writeFileSync(fileStorePath + "/" + this.userInfo.userid + ".json", JSON.stringify(data));
			return true;
		} else {
			const data = {
				userid: this.userInfo.userid,
				favorites: [{url: url, title: title, thumbnail: thumbnail}],
				history: []
			}
			fs.writeFileSync(fileStorePath + "/" + this.userInfo.userid + ".json", JSON.stringify(data));
			return true;
		}
	}
	removeFavorite(url) {
		if (fs.existsSync(fileStorePath + "/" + this.userInfo.userid + ".json")) {
			const data = JSON.parse(fs.readFileSync(fileStorePath + "/" + this.userInfo.userid + ".json"));
			const oldLength = data.favorites.length;
			data.favorites = data.favorites.filter((e) => e.url !== url);
			if (oldLength === data.favorites.length) return false;
			fs.writeFileSync(fileStorePath + "/" + this.userInfo.userid + ".json", JSON.stringify(data));
			return true;
		} else {
			return false;
		}
	}
	addHistory(url, title, thumbnail) {
		console.log(this.userInfo)
		let data;
		if (fs.existsSync(fileStorePath + "/" + this.userInfo.userid + ".json")) {
			data = JSON.parse(fs.readFileSync(fileStorePath + "/" + this.userInfo.userid + ".json"));
			console.log(data)
			if (data.history.find((e) => e.url === url)) return false;
			data.history.unshift({url: url, title: title, thumbnail: thumbnail});
			fs.writeFileSync(fileStorePath + "/" + this.userInfo.userid + ".json", JSON.stringify(data));
			return true;
		} else {
			data = {
				userid: this.userInfo.userid,
				favorites: [],
				history: [{url: url, title: title, thumbnail: thumbnail}]
			}
			fs.writeFileSync(fileStorePath + "/" + this.userInfo.userid + ".json", JSON.stringify(data));
			return true;
		}
	}
	removeHistory(url) {
		if (fs.existsSync(fileStorePath + "/" + this.userInfo.userid + ".json")) {
			const data = JSON.parse(fs.readFileSync(fileStorePath + "/" + this.userInfo.userid + ".json"));
			const oldLength = data.history.length;
			data.history = data.history.filter((e) => e.url !== url);
			if (oldLength === data.history.length) return false;
			fs.writeFileSync(fileStorePath + "/" + this.userInfo.userid + ".json", JSON.stringify(data));
			return true;
		}
	}
	getFavorites() {
		if (fs.existsSync(fileStorePath + "/" + this.userInfo.userid + ".json")) {
			const data = JSON.parse(fs.readFileSync(fileStorePath + "/" + this.userInfo.userid + ".json"));
			return data.favorites;
		} else {
			return [];
		}
	}
	getHistory() {
		if (fs.existsSync(fileStorePath + "/" + this.userInfo.userid + ".json")) {
			const data = JSON.parse(fs.readFileSync(fileStorePath + "/" + this.userInfo.userid + ".json"));
			return data.history;
		} else {
			return [];
		}
	}
}

//check filestore folder and create
if(!fs.existsSync(fileStorePath)) {
	fs.mkdirSync(fileStorePath + "/oauth2", {
		recursive: true
	});
}

if(!fs.existsSync(fileStorePath + "/user.data.json")) {
	fs.writeFileSync(fileStorePath + "/user.data.json", JSON.stringify({users: {}}));
}


// test endpoint
app.get("/", function (req, res) {
	res.send("It's alive!");
});


// oauth
app.post("/oauth2/createtoken",
	oneOf([
		header("Authorization")
			.exists(),
	],
		{
			message: "Authorization header required",
		}),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });
		const token = req.headers["authorization"];

		const user = new User(token);
		if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });
		if (user.userInfo.type !== "password") return res.status(400).json({ status: "error", errorReason: "Invalid token type" });
		if (!req.body.client_id) return res.status(400).json({ status: "error", errorReason: "client_id is required" });
		if (!req.body.redirect_uri) return res.status(400).json({ status: "error", errorReason: "redirect_uri is required" });
		if (!req.body.state) return res.status(400).json({ status: "error", errorReason: "state is required" });
		const newToken = jwt.sign({
			userid: user.userInfo.userid,
			type: "oauth2"
		}, jwtcfg.secret, jwtcfg.options);
		const uuid = uuidv7();
		fs.writeFileSync(fileStorePath + "/oauth2/" + uuid + ".json", JSON.stringify({ token: newToken, userid: user.userInfo.userid, redirect_uri: req.body.redirect_uri, client_id: req.body.client_id, state: req.body.state }));
		return res.status(200).json({code: uuid});
	}
);

app.post("/oauth2/token", function (req, res) {
	if (!req.body.client_id) return res.status(400).json({ error: "client_id is required" });
	if (!req.body.code) return res.status(400).json({ error: "code is required" });
	if (!req.body.redirect_uri) return res.status(400).json({ error: "redirect_uri is required" });
	if (!req.body.grant_type) return res.status(400).json({ error: "grant_type is required" });
	if (!req.body.code.match(/^[A-Za-z0-9\-]*$/)) return res.status(400).json({ status: "error", errorReason: "Invalid code" });
	const data = JSON.parse(fs.readFileSync(fileStorePath + "/oauth2/" + req.body.code + ".json"));
	if (data.client_id !== req.body.client_id) return res.status(400).json({ error: "client_id is invalid" });
	if (data.redirect_uri !== req.body.redirect_uri) return res.status(400).json({ error: "redirect_uri is invalid" });
	return res.status(200).json({ access_token: data.token, token_type: "bearer" });
})

//webui endpoints

app.post("/register", async function (req, res) {
	if (!req.body.userid) return res.status(400).json({ status: "error", errorReason: "User ID is required" });
	if (!req.body.password) return res.status(400).json({ status: "error", errorReason: "Password is required" });
	if (!req.body.userid.match(/^[A-Za-z0-9]*$/)) return res.status(400).json({ status: "error", errorReason: "Invalid User ID" });
	const data = JSON.parse(fs.readFileSync(fileStorePath + "/user.data.json"));
	if (data.users[req.body.userid]) {
		return res.status(400).json({ status: "error", errorReason: "User already exists" });
	}
	data.users[req.body.userid] = await bcrypt.hash(req.body.password, 10);
	fs.writeFileSync(fileStorePath + "/user.data.json", JSON.stringify(data));
	// return res.status(200).json({ status: "success" });
	const token = jwt.sign({
		userid: req.body.userid,
		type: "password",
	}, jwtcfg.secret, jwtcfg.options);
	res.json({status: "success", token: token});
});
app.post("/login", async function (req, res) {
	if (!req.body.userid) return res.status(400).json({ status: "error", errorReason: "User ID is required" });
	if (!req.body.password) return res.status(400).json({ status: "error", errorReason: "Password is required" });
	if (!req.body.userid.match(/^[A-Za-z0-9]*$/)) return res.status(400).json({ status: "error", errorReason: "Invalid User ID" });
	const data = JSON.parse(fs.readFileSync(fileStorePath + "/user.data.json"));
	if (!data.users[req.body.userid] || !await bcrypt.compare(req.body.password, data.users[req.body.userid])) {
		return res.status(400).json({ status: "error", errorReason: "Username or password is incorrect" });
	}
	const token = jwt.sign({
		userid: req.body.userid,
		type: "password"
	}, jwtcfg.secret, jwtcfg.options);
	res.json({ token: token });
});

app.get("/isloggedin", function (req, res) {
    if (!req.headers["authorization"]) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });
    const user = new User(req.headers["authorization"]);
    if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });
    return res.status(200).json({ status: "success" });
});

//get favorite
app.get("/users/favorites",
	oneOf([
		header("Authorization")
			.exists(),
	],
		{
			message: "Authorization header required",
		}),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });

		const token = req.headers["authorization"];
		console.log(token)
		const user = new User(token);

		if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });

		return res.status(200).json(user.getFavorites());
	}
);


//add favorite
app.post("/users/favorites",
	oneOf([
		header("Authorization")
			.exists(),
	],
		{
			message: "Authorization header required",
		}),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });

		const token = req.headers["authorization"];

		const user = new User(token);
		if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });

		if (!req.body.url) return res.status(400).json({ status: "error", errorReason: "URL is required" });
		
		console.log(req.query)
		const videoInfo = await ytdl.getBasicInfo(req.body.url);
		if (user.addFavorite(req.body.url, videoInfo.videoDetails.title, `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`)) {
			return res.status(200).json({ status: "success" });
		} else {
			return res.status(400).json({ status: "error", errorReason: "URL already exists" });
		}
	}
);

//delete favorite
app.delete(
	"/users/favorites",
	oneOf([
		header("Authorization")
			.exists(),
	],
		{
			message: "Authorization header required",
		}),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });

		const token = req.headers["authorization"];
		const user = new User(token);

		if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });
		if (!req.body.url) return res.status(400).json({ status: "error", errorReason: "URL is required" });
		if (user.removeFavorite(req.body.url)) {
			return res.status(200).json({ status: "success" });
		} else {
			return res.status(400).json({ status: "error", errorReason: "URL not found" });
		}

	}
);


//get history
app.get("/users/histories",
	oneOf([
		header("Authorization")
			.exists(),
	],
		{
			message: "Authorization header required",
		}),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });

		const token = req.headers["authorization"];
		console.log(token)
		const user = new User(token);

		if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });

		return res.status(200).json(user.getHistory());
	}
);
;

//delete history
app.delete(
	"/users/histories",
	oneOf([
		header("Authorization")
			.exists(),
	],
		{
			message: "Authorization header required",
		}),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ status: "error", errorReason: "Authorization header required" });

		const token = req.headers["authorization"];
		const user = new User(token);

		if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });
		if (!req.body.url) return res.status(400).json({ status: "error", errorReason: "URL is required" });
		if (user.removeHistory(req.body.url)) {
			return res.status(200).json({ status: "success" });
		} else {
			return res.status(400).json({ status: "error", errorReason: "URL not found" });
		}

	}
);
//youtube audio extract endpoint
app.get("/api/getAudio",
	oneOf([
		query("url")
			.exists(),
		query("id")
			.exists(),
	],
		{
			message: "URL or id is required.",
		}),
	async function (req, res) {
		console.log("a")
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ errors: validateError.array() });
		//validate url/id
		if (req.query.url && !ytdl.validateURL(req.query.url)) return res.status(400).json({ error: "URL is invalid." });
		if (req.query.id && !ytdl.validateID(req.query.id)) return res.status(400).json({ error: "ID is invalid" });
		//validate user
		/*if (!req.headers["authorization"]) return res.status(400).json({ error: "Authorization header required." });
		const user = new User(req.headers["authorization"]);
		if (user.userInfo == null) return res.status(400).json({ error: "User not found." });*/

		//check live video
		const videoInfo = await ytdl.getBasicInfo(req.query.url ?? req.query.id);
		if (videoInfo.videoDetails.isLiveContent) return res.status(400).json({ error: "Can't download Live video." });

		try {
			//create uuid filename
			const fileName = uuidv7() + ".m4a";

			//if auth header is available, add history to user
			if (req.headers["authorization"]) {
				const user = new User(req.headers["authorization"]);
				if (user.userInfo == null) return res.status(400).json({ status: "error", errorReason: "User not found" });
				user.addHistory(videoInfo.videoDetails.video_url, videoInfo.videoDetails.title, `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`);
			}
			

			//download audio
			const stream = ytdl(req.query.url ?? req.query.id, { quality: "highestaudio" });
			const file = fs.createWriteStream(fileStorePath + "/" + fileName);
			stream.pipe(file)
			stream.on("end", () => {
				res.status(200).json({
					status: "success",
					title: videoInfo.videoDetails.title,
					thumbnail: `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`,
					url: baseURL + "/cdn/" + fileName,
				});
				return;
			});
			return;
		} catch (e) {
			console.log(e);
			return res.status(400).json({ error: "Error occured while downloading" });
		};
	}
);

// youtube search endpoint
app.get("/api/searchVideo",
	query("q", "Search query is required.").exists(),
	async function (req, res) {
		const validateError = validationResult(req);
		if (!validateError.isEmpty()) return res.status(400).json({ errors: validateError.array() });
		const result = await ytsr(req.query.q, { safeSearch: true, limit: 5 });
		const arr = {
			"query": req.query.q,
			"items": new Array()
		};
		//sort searched videos
		for (const video of result.items) {
			const item = {
				"title": video.name,
				"url": video.url,
				"id": video.id,
				"thumbnail": video.thumbnail
			};

			arr.items.push(item);
		};

		return res.status(200).json(arr);
	}
);

// Serve downloaded files
app.use("/cdn", express.static(fileStorePath));

// Listen port
app.listen(port, function () {
	console.log(`Started on ${port}`);
});
