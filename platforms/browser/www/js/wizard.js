/*jslint browser: true*/
/*global $, console, Mnemonic, jQuery, alert*/

//for generating new keys
var mnemonic = new Mnemonic("english");
var seed = null;
var bip32RootKey = null;
var bip32ExtendedKey = null;
var network = {
	bip32: {
		public: 0x0488b21e,
		private: 0x0488ade4
	},
	pubKeyHash: 0x4c, //0x8b testnet and 0x4c mainnet
	scriptHash: 0x10,
	wif: 0xcc
};

function generateRandomPhrase() {
	var numWords = 24,
		strength = numWords / 3 * 32,
		words = mnemonic.generate(strength);
	//outputs words to console
	console.log("Phrase: " + words);
	return words;
}

function calcBip32ExtendedKey(path) {
	// Check there's a root key to derive from
	if (!bip32RootKey) {
		return bip32RootKey;
	}
	var extendedKey = bip32RootKey;
	// Derive the key from the path
	var pathBits = path.split("/");
	for (var i = 0; i < pathBits.length; i++) {
		var bit = pathBits[i];
		var index = parseInt(bit);
		if (isNaN(index)) {
			continue;
		}
		var hardened = bit[bit.length - 1] == "'";
		var isPriv = "privKey" in extendedKey;
		var invalidDerivationPath = hardened && !isPriv;
		if (invalidDerivationPath) {
			extendedKey = null;
		} else if (hardened) {
			extendedKey = extendedKey.deriveHardened(index);
		} else {
			extendedKey = extendedKey.derive(index);
		}
	}
	return extendedKey
}

function bip44() {
	var path = "m/44'/5'/0'/";
	// Calculate the account extended keys
	var accountExtendedKey = calcBip32ExtendedKey(path);
	var accountXprv = accountExtendedKey.toBase58();
	var accountXpub = accountExtendedKey.toBase58(false);
	// Display the extended keys
	$("#xpubgen").val(accountXpub);
	$("#xprvgen").val(accountXprv);
	console.log("Account Priv: " + accountXprv);
	console.log("Account Pub: " + accountXpub);

	localStorage.setItem('xpubKey', accountXpub);
	localStorage.setItem('indexSource', 0);

	console.log("index is 0")
	console.log("xpub Saved");
}

function generateClicked() {
	setTimeout(function () {
		var phrase = generateRandomPhrase();
		if (!phrase) {
			console.log("NO PHRASE");
			return;
		}
		seed = mnemonic.toSeed(phrase);
		bip32RootKey = bitcoin.HDNode.fromSeedHex(seed, network);
		console.log("Seed: " + seed);
		bip44();
	}, 50);
}
//end key generation functions

function next() {
	$("#wizard1").toggleClass("hidden");
	$("#wizard2").toggleClass("hidden");
}

function existing() {
	var visited = localStorage.getItem('visited');
	localStorage.setItem('visited', true);
	window.location.href = "home.html";
}

function wizardBack() {
	$("#wizard1").toggleClass("hidden");
	$("#wizard2").toggleClass("hidden");
}

//onclick generate keys, populate page
function generate() {
	var storeName = $("#storeName").val();
	localStorage.setItem('storeName', storeName);
	localStorage.setItem('server', 'http://localhost:5005');
	generateClicked();
	$("#wizard2").toggleClass("hidden");
	$("#wizard3").toggleClass("hidden");

}