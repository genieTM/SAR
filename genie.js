/*---genie.js-------

javascript:d=document;s=d.createElement('script');s.src='https://bit.ly/2mUZwkh';s.id='genie.js';d.head.appendChild(s);

目標のサイトを開き上記のBookmarkletを実行すると
機能1: 読み込んだQRコードに記載されたjavascriptが実行されます。
機能2: jsファイルのDnDで、javascriptが実行されます。
機能3: javascriptを直接入力してblurすると、javascriptが実行されます。

QRコードの例、アロー形式の即時実行型がお薦め
(()=>{
  bootpwd = '';
  URLs=['https://xxxxx/abc.js'  , 'https://yyyy/efg.js'];
  mSAR();
})();
*/

WakeupGenie();
InstascanPlus();

var bootLoader;
mSAR();
function mSAR() {
    /*暗号化データ解凍用libraryを最初にimport*/
    if(typeof(URLs)=='undefined') URLs=[];
    if (!document.getElementById('aes.js')) {
        URLs = ['https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js', 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/pbkdf2.js'].concat(URLs);
    }
    //保存されたPWDがあれば、それを優先させる
    var lsPW = localStorage.getItem('bootpwd');
    if (lsPW)
        bootpwd = lsPW;
    else if(typeof(bootpwd)=='undefined')
        bootpwd = '';
    else
        if(bootpwd.length>0)
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
            if (txt.length>0)
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
    d.body.appendChild(s); //---bodyなら問題ない
}
function appendScriptSrc(c_name, source) {
    var d = document;
    var s = d.createElement('script');
    s.id = c_name;
	s.type = 'text/javascript';
	s.src =  source;
    d.body.appendChild(s); //---bodyなら問題ない
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
function setLocalStorage(c_name, val) {
    if (typeof(val) == "object")
        localStorage.setItem(c_name, JSON.stringify(val));
    else
        localStorage.setItem(c_name, val);
    return;
}
function clearmSAR() {
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
function WakeupGenie() {
	var d=document;
	var el;
    el = document.createElement('div');
    el.setAttribute('class', 'inline-block_test');
	var buf = '<button style="background-color:#e0e0ff" onclick="toggleQR()">QR</button>'
	        + '<input id="genie" size="50" style="background-color:#e0e0ff" placehoder="DnD or direct JS-code"></input>';
    el.innerHTML = buf;
    d.body.insertBefore(el, d.body.firstChild);

    genie = d.getElementById('genie');

    genie.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    // Get file data on drop, and save to localStorage
    // THe file should be un-encrypted .js file
    genie.addEventListener('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            fname = f.name;
            if (fname.slice(-3) == '.js') {
                var reader = new FileReader();
                reader.onload = function (theFile) {
                    var text = reader.result.trim();
                    if (text.indexOf('javascript:') == 0)
                        eval(text);
                    else
                        setLocalStorage(fname, text);
                }
                reader.readAsText(files[i]);
            }
        }
    });
    genie.addEventListener('blur', function (e) {
        eval(genie.value);
    });
}
//-------------
// InstascanPlus
//-------------
function InstascanPlus_0() {
    if (d.location == 'https://schmich.github.io/instascan/') {
        li = d.getElementsByTagName('li');
        function collect() {
            b = [];
            for (i = li.length - 1; i > 0; i--) {
		li[i].innerHTML = li[i].title;
                b.push(li[i].innerHTML);
                f = b.join('\n');
                c = d.getElementById('genie');
            }
            var p=f.indexOf('<');
            if(p>0)  f=f.slice(0,p);    //for Andoroid
            if (c.value != f)
                c.value = f.replace(/\?/g, '');
        };
        setInterval(collect, 200);
    }
}

function InstascanPlus() {
    var e = document.createElement('style');
	e.setAttribute('id', 'style');
	var buf = '';
    buf = buf + 'body, html {   padding: 0;   margin: 0;   font-family: "Helvetica Neue", "Calibri", Arial, sans-serif;   height: 100%; }';
    buf = buf + '#app {   background: #263238;   display: flex;   align-items: stretch;   justify-content: stretch;   height: 100%; }';
    buf = buf + '.sidebar {   background: #eceff1;   min-width: 250px;   display: flex;   flex-direction: column;   justify-content: flex-start;   overflow: auto; }';
    buf = buf + '.sidebar h2 {   font-weight: normal;   font-size: 1.0rem;   background: #607d8b;   color: #fff;   padding: 10px;   margin: 0; }';
    buf = buf + '.sidebar ul {   margin: 0;   padding: 0;   list-style-type: none; }';
    buf = buf + '.sidebar li {   line-height: 175%;   white-space: nowrap;   overflow: hidden;   text-wrap: none;   text-overflow: ellipsis; }';
    buf = buf + '.cameras ul {   padding: 15px 20px; }';
    buf = buf + '.cameras .active {   font-weight: bold;   color: #009900; }';
    buf = buf + '.cameras a {   color: #555;   text-decoration: none;   cursor: pointer; }';
    buf = buf + '.cameras a:hover {   text-decoration: underline; }';
    buf = buf + '.scans li {   padding: 10px 20px;   border-bottom: 1px solid #ccc; }';
    buf = buf + '.scans-enter-active {   transition: background 3s; }';
    buf = buf + '.scans-enter {   background: yellow; }';
    buf = buf + '.empty {   font-style: italic; }';
    buf = buf + '.preview-container {   flex-direction: column;   align-items: center;   justify-content: center;   display: flex;   width: 100%;   overflow: hidden; }';
	e.innerHTML = buf;
    document.body.insertBefore(e,d.body.firstChild.nextSibling);
	appendScriptSrc("adapter.min.js", "https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/3.3.3/adapter.min.js");
	appendScriptSrc("vue.min.js", 		"https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.10/vue.min.js");
	appendScriptSrc("instascan.min.js", "https://rawgit.com/schmich/instascan-builds/master/instascan.min.js");
	el = d.createElement('div');
	el.id ='app';
        buf = '<div class="sidebar">' 
		  + '	  <section class="cameras">' 
		  + '       <h2>Cameras</h2>' 
		  + '       <ul>' 
		  + '          <li v-if="cameras.length === 0" class="empty">No cameras found</li>' 
 		  + '          <li v-for="camera in cameras">' 
		  + '          <span v-if="camera.id == activeCameraId" :title="formatName(camera.name)" class="active">{{ formatName(camera.name) }}</span>' 
 		  + '          <span v-if="camera.id != activeCameraId" :title="formatName(camera.name)">' 
 		  + '             <a @click.stop="selectCamera(camera)">{{ formatName(camera.name) }}</a>' 
 		  + '          </span>' 
 		  + '          </li>' 
		  + '       </ul>' 
		  + '    </section>' 
		  + '    <section class="scans">' 
 		  + '       <h2>Scans</h2>' 
		  + '          <ul v-if="scans.length === 0">' 
		  + '            <li class="empty"></li>' 
		  + '          </ul>' 
		  + '          <transition-group name="scans" tag="ul">' 
		  + '            <li v-for="scan in scans" :key="scan.date" :title="scan.content"></li>' 
		  + '          </transition-group>' 
		  + '    </section>' 
		  + '</div>' 
		  + '<div class="preview-container">' 
		  + '	  <video id="preview"></video>' 
 		  + '</div>' 
	el.innerHTML = buf;
        document.body.insertBefore(el,d.body.firstChild.nextSibling.nextSibling);
	d.getElementById('app').setAttribute('style','display:blocked');

	setTimeout(	(function (){
		appendScriptSrc("app.js","https://schmich.github.io/instascan/app.js")
	}),1000);

	li = d.getElementsByTagName('li');
	function collect() {
		b = [];
		for (i = li.length - 1; i > 0; i--) {
			li[i].innerHTML = li[i].title;
			b.push(li[i].innerHTML);
			f = b.join(' \n').replace(/\?/g, '');
			c = d.getElementById('genie');
		}
		var p=f.indexOf('<');
		if(p>0)  f=f.slice(0,p);    //for Andoroid
		if (c.value.length < f.length)
			c.value = f.trim();
		//即時実行アロー関数形式なら (()=>{ /*関数本体*/ })();
		if( c.value.indexOf("(()=>{")==0 && c.value.indexOf("})()")>0 ) {
			eval( c.value );
			c.value = '';
		}
		
	};
	setInterval(collect, 500);
}
function toggleQR(){
	var el = document.getElementById('app');
	if (el.style.display == 'none') {
		el.setAttribute('style', 'display:blocked');
		app.scanner.start();
	} else {
		el.setAttribute('style', 'display:none');
		app.scanner.stop();
	}
}

