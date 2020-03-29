/*---genie.js-------

javascript:d=document;s=d.createElement('script');s.src='https://bit.ly/2mUZwkh';s.id='genie.js';d.head.appendChild(s);

目標のサイトを開き上記のBookmarkletを実行すると
機能1: jsファイルのDnDで、javascriptが実行されます。
機能2: javascriptを直接入力してblurすると、javascriptが実行されます。

QRコードの例、アロー形式の即時実行型がお薦め
(()=>{
bootpwd = '';
URLs=['https://xxxxx/abc.js'  , 'https://yyyy/efg.js'];
Genie();
})();
 */

var bootLoader;
var Short_Cut = {};
var speakBuff = [];
var genieHomeWork= ['pasteTo("genie")'];
//====Genie===================
Genie();		//Genie Loader
WakeupGenie();

async function speak(txt, lang, volume, rate, pitch) {
    if(txt.length>0) 	speakBuff.push(txt);
    while(speakBuff.length>0) {
            var uttr = new SpeechSynthesisUtterance(); 
            uttr.text = speakBuff.shift();
            if(lang==undefined)   uttr.lang   = 'ja-JP'; else uttr.lang  = lang;
            if(volume==undefined) uttr.volume = 1.0    ; else uttr.volume= volume;
            if(rate==undefined)   uttr.rate   = 1.0    ; else uttr.rate  = rate;
            if(pitch==undefined)  uttr.pitch  = 1.0    ; else uttr.pitch = pitch;
            await speechSynthesis.speak(uttr);
    }
}
	
function Genie() {
    /*暗号化データ解凍用libraryを最初にimport*/
    if (typeof(URLs) == 'undefined')
        URLs = [];
    if (!document.getElementById('aes.js')) {
        URLs = ['https://qrde.github.io/SAR/crypt-js-3.1.2-aes.js',
				'https://qrde.github.io/SAR/crypt-js-3.1.2-pbkdf2.js',
				'https://qrde.github.io/SAR/mousetrap.js'
				].concat(URLs);
    }
    //保存されたPWDがあれば、それを優先させる
    var lsPW = localStorage.getItem('bootpwd');
    if (lsPW)
        bootpwd = lsPW;
    else if (typeof(bootpwd) == 'undefined')
        bootpwd = '';
    else
        if (bootpwd.length > 0)
            localStorage.setItem('bootpwd', bootpwd);

    bootLoader = bootLoaderFunc();
    bootLoader.next();	
}

function  * bootLoaderFunc() {
    while (URLs.length > 0) {
        var url = URLs.shift();
        var name = url.slice(url.lastIndexOf('/') + 1);
        if (typeof(nameExists) == 'undefined')
            nameExists = {};
        if (!nameExists[name]) {
            nameExists[name] = true;
            if (!document.getElementById(name)) {
                var source = localStorage.getItem(name);
                if (!!source) {
                    appendScript(name, source);
					if (name == 'mousetrap.js')
						setTimeout(initShortCut(), 1000);
                    continue;
                } else {
                    var oReq = new XMLHttpRequest();
                    oReq.addEventListener('load', reqListener);
                    oReq.open('GET', url);
                    oReq.send();
                    yield;
                }
            }
        }
    }
}

function reqListener() {
    var source = this.responseText;
    if (source.slice(0, 2) != '//' && source.slice(0, 2) != '/*') {
        try {
            var txt = decript(bootpwd, source);
            if (txt.length > 0)
                source = txt;
        } catch {};
    }
    var u = this.responseURL;
    var name = u.slice(u.lastIndexOf('/') + 1);
    appendScript(name, source);
    localStorage.setItem(name, source);
    bootLoader.next();
};
function appendScript(c_name, source) {
    var d = document;
    var s = d.createElement('script');
    s.id = c_name;
    s.charset = 'UTF-8';
    s.innerHTML = source;
    //  d.head.appendChild(s);  //---headにするとメモリーの少ない機種ではフリーズする
	try{
		d.body.appendChild(s); //---bodyなら問題ない
	}catch{
		console.log('appendScript_Err: '+c_name+'\r\n');
	}
}
function appendScriptSrc(c_name, source) {
    var d = document;
    var s = d.createElement('script');
    s.id = c_name;
    s.type = 'text/javascript';
    s.src = source;
    var border = d.getElementById('---border---');
    border.parentNode.insertBefore(s, border);
}
function decript(pwd, text) {
    var array_rawData = text.split(',');
    var salt = CryptoJS.enc.Hex.parse(array_rawData[0]);
    var iv = CryptoJS.enc.Hex.parse(array_rawData[1]);
    var encrypted_data = CryptoJS.enc.Base64.parse(array_rawData[2]);
    var secret_passphrase = CryptoJS.enc.Utf8.parse(pwd);
    var key128Bits500Iterations = CryptoJS.PBKDF2(secret_passphrase, salt, {
            keySize: 128 / 8,
            iterations: 500
        });
    var options = {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    };
    var decrypted = CryptoJS.AES.decrypt({
            'ciphertext': encrypted_data
        }, key128Bits500Iterations, options);
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function getLocalStorage(c_name) {
    var rtn = localStorage.getItem(c_name);
    if (rtn == null) return '';
    if (rtn.charAt(0) == '[' || rtn.charAt(0) == '{')
        return JSON.parse(rtn);
    return rtn;
}

function setLocalStorage(c_name, val) {
    if (typeof(val) == "object")
        localStorage.setItem(c_name, JSON.stringify(val));
    else
        localStorage.setItem(c_name, val);
    return;
}
function clearGenie() {
    var scr = document.getElementsByTagName('script');
    for (var i = scr.length - 1; i >= 0; i--) {
        if (scr[i].id != '') {
            scr[i].remove();
            localStorage.removeItem(scr[i]);
        }
    }
}
//----------
// Genie serves what you wish.
//----------
// position:absolute; top:-20px; left:0px;width:4%; height:20px;
var lastCmd = '';
function WakeupGenie() {
    var d = document;
    var el;
    el = document.createElement('div');
    el.id = 'genie-block';
    el.setAttribute('style', 'width:100%');
    var buf ='<input id="GenieHome" type="button" onclick="execGenieHomeWork()" value=" " '
			+'style="z-index:-10000; position:absolute; top:2px; left:0px;width:30px; height:20px; ">'
			+ '</input><input id="genie" style="z-index:-10000; position:absolute; left:30px;top:0px;width:95%; height:20px; background-color:#e0e0ff"></input>';
//    var buf ='<input id="GenieHome" type="button" onclick="execGenieHomeWork()" value=" " '
//			+'style="width:4%"></input><input id="genie" style="width:95%; background-color:#e0e0ff"></input>';
    el.innerHTML = buf;
    d.body.insertBefore(el, d.body.firstChild);

    genie = d.getElementById('genie');

    genie.addEventListener('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    genie.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });

    // Get file data on drop, and save to localStorage
    // THe file should be un-encrypted .js file
    genie.addEventListener('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            fname = file.name;
            if (fname.slice(-3) == '.js') {
                var reader = new FileReader();
                reader.fname = fname;
                reader.onload = function (theFile) {
                    var fname = this.fname;
                    var text = reader.result.trim();
                    //即時実行アロー関数形式なら (()=>{ /*関数本体*/ })();
                    var p_ = text.indexOf("(()=>{");
                    var q_ = text.indexOf("})()");
                    if (p_ == 0 && q_ > 0) {
                        text = text.slice(p_ + 6, q_);
                        eval(text);
                    } else if (text.indexOf('javascript:') == 0) {
                        eval(text);
                    } else
                        setLocalStorage(fname, text);
                }
                reader.readAsText(file);
            }
        }
    });
    genie.addEventListener('blur', function (e) {
        var text = genie.value;
        var p_ = text.indexOf("(()=>{");
        var q_ = text.indexOf("})()");
        if (text.slice(-1) == '=') {
            genie.value = genie.value +' '+ eval(text.slice(0, -1));
			setTimeout((()=>{genie.value='';}),2000);
		}if (text.slice(-1) == ';') {
            eval(text);
            genie.value = '';
        } else if (p_ == 0 && q_ > 0) {
            text = text.slice(p_ + 6, q_);
            lastCmd = text;
            eval(text);
            genie.value = '';
        } else if (text.indexOf('javascript:') == 0) {
            text = text.slice(11);
            lastCmd = text;
            eval(text);
            genie.value = '';
        }
    });
}
function clearLStorage_js(){
	var sKey,js=[]; 
	for(var i=0; sKey = window.localStorage.key(i); i++)
		if(sKey.slice(-3)=='.js') js.push(sKey);
		for(var i=js.length-1; i>=0; i--)
			localStorage.removeItem(js[i]);
}
function showHideGenie() {
	var _genie=document.getElementById('genie');
	var _genieHome=document.getElementById('GenieHome');
	if(_genie.style.zIndex<0){
		_genie.style.backgroundColor="#e0e0ff";
		_genie.style.zIndex=100;
		_genieHome.style.zIndex=100;
	}else{
		_genie.style.backgroundColor="#000000";
		_genie.style.zIndex=-100;
		_genieHome.style.zIndex=-100;
	}
}
function execGenieHomeWork() {
	for( var i=0; i<genieHomeWork.length; i++ )
		eval( genieHomeWork[i] );
}
function getUserType() {
    var ua = ["iPod", "iPad", "iPhone","Android"];
    for (var i = 0; i < ua.length; i++) {
        if (navigator.userAgent.indexOf(ua[i]) > 0) {
            return i;
        }
    }
    return i;	//PCでは 4　になる
}

//=====short cuts====
function initShortCut() {
    addShortCut('help', '/*---ヘルプ表示---*/      showShortCut()');
	addShortCut('alt+shift+g ', '/*genie toggle*/    showHideGenie()');
}
function addShortCut(keys, func) {
	if(keys.indexOf(' ')>=0)	addShortCut_Org(keys.trim(), func);
	else addShortCut_Org(keys.split('').join(' '), func);	
}
function addShortCut_Org(keys, func) {
		eval("Mousetrap.bind('keys',function(e){ fnc })".replace('keys', keys).replace('fnc', func));
		Short_Cut[keys] = func;
}
function showShortCut() {
    var buf = "";
    for (var key in Short_Cut){
		var text = Short_Cut[key];
			text = text.replace('/*','').replace('*/','');
        buf += "'" + key.replace(/ /g,'') + "' :   '" + text + "'\n";
	}
    document.getElementById('genie').value = 'ショートカット一覧を、クリップボードにコピーしました';
    setClipB( buf );
}

//
function pasteTo(id){
	if(navigator.clipboard){
		navigator.clipboard.readText()
		.then(function(text){
			document.getElementById(id).value = text;
		});
	}
}
function setClipB(text){
	if(navigator.clipboard)
		navigator.clipboard.writeText(text);
}
	
