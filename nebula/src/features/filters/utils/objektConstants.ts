// artist與member的映射
export const ARTIST_MEMBERS_MAPING: { [key: string]: string[] } = {
	tripleS: [
		"SeoYeon",
		"HyeRin",
		"JiWoo",
		"ChaeYeon",
		"YooYeon",
		"SooMin",
		"NaKyoung",
		"YuBin",
		"Kaede",
		"DaHyun",
		"Kotone",
		"YeonJi",
		"Nien",
		"SoHyun",
		"Xinyu",
		"Mayu",
		"Lynn",
		"JooBin",
		"HaYeon",
		"ShiOn",
		"ChaeWon",
		"Sullin",
		"SeoAh",
		"JiYeon",
	],
	artms: ["HeeJin", "HaSeul", "KimLip", "JinSoul", "Choerry"],
};

// season縮寫映射
export const SEASON_MAPPING: { [key: string]: string } = {
	A: "Atom01",
	B: "Binary01",
	C: "Cream01",
	D: "Divine01",
	E: "Ever01",
};

// class常數，有可能有新class，所以之後應該要改成從後端取得
export const CLASSES = [
	"First",
	"Double",
	"Special",
	"Premier",
	"Welcome",
	"Zero",
];
