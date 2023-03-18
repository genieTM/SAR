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
//====Genie===================
Genie();		//Genie Loader
WakeupGenie();

function Genie() {
    /*暗号化データ解凍用libraryを最初にimport*/
    if (typeof(URLs) == 'undefined')
        URLs = [];
    if (!document.getElementById('aes.js')) {
        URLs = ['https://qrde.github.io/SAR/mousetrap.js'
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

    downloadFiles();
}

async function downloadFile(url) {
  const response = await fetch(url);
  return response.text();
}

//localStorage または downloadした.jsファイルを<script>として追加
async function downloadFiles() {
  for (const url of URLs) {
    var name = url.slice(url.lastIndexOf('/') + 1);
    var source = localStorage.getItem(name);
    if(!source)
        source = await downloadFile(url);
    appendScript(name, source);
  }
}

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

async function encrypt(pwd, plainText) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = pbkdf2Sync(pwd, salt, 500, 16, 'sha512');
  const cipher = AES.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${salt.toString('hex')},${iv.toString('hex')},${encrypted}`;
}

async function decrypt(pwd, encryptedText) {
  const [salt, iv, encrypted] = encryptedText.split(',');
  const saltBuffer = Buffer.from(salt, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const key = pbkdf2Sync(pwd, saltBuffer, 500, 16, 'sha512');
  const decipher = AES.createDecipheriv('aes-128-cbc', key, ivBuffer);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
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
function getSessionStorage(c_name) {
    var rtn = sessionStorage.getItem(c_name);
    if (rtn == null) return '';
    if (rtn.charAt(0) == '[' || rtn.charAt(0) == '{')
        return JSON.parse(rtn);
    return rtn;
}

function setSessionStorage(c_name, val) {
    if (typeof(val) == "object")
        sessionStorage.setItem(c_name, JSON.stringify(val));
    else
        sessionStorage.setItem(c_name, val);
    return;
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
	
function clearLStorage_js(){
	var sKey,js=[]; 
	for(var i=0; sKey = window.localStorage.key(i); i++)
		if(sKey.slice(-3)=='.js') js.push(sKey);
		for(var i=js.length-1; i>=0; i--)
			localStorage.removeItem(js[i]);
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
    var buf ='<input id="tglGenie" type="button" value="" title="tglGenie" onclick="showHideGenie()" style="z-index:110;position:absolute;top:0px;left:0px;width: 9px;height: 26px;background-color:#4040ff;padding-left: 0px;padding-right: 0px;border-left-width: 1px;border-right-width: 1px;border-bottom-width: 1px;border-top-width: 1px;padding-top: 2px;">'
			+ '<input id="genie" value="" title="genie" style="z-index:-110; position:absolute; left:8px;top:-1px;width:100%; height:20px; color:#404040; background-color:#efefff"></input>';
    el.innerHTML = buf;
    d.body.insertBefore(el, d.body.firstChild);

    genie = d.getElementById('genie');
}

function showHideGenie() {
	var _genie=document.getElementById('genie');
	var _tglgenie=document.getElementById('tglGenie');
	if(_genie.style.zIndex<0){
		_tglgenie.style.backgroundColor="#4040ff";
		_genie.style.backgroundColor="#efefff";
		_genie.style.zIndex=110;
		// _tglgenie.style.zIndex=101;
	}else{
		_genie.style.zIndex=-110;
		_genie.style.backgroundColor="#000000";
		// _tglgenie.style.zIndex=-101;
	}
}
function showGenie() {
	var _genie=document.getElementById('genie');
	var _tglgenie=document.getElementById('tglGenie');
    _tglgenie.style.backgroundColor="#4040ff";
    _genie.style.backgroundColor="#efefff";
    _genie.style.zIndex=110;
}
function hideGenie() {
	var _genie=document.getElementById('genie');
		_genie.style.zIndex=-110;
		_genie.style.backgroundColor="#000000";
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

function popupGenie(msg,msec){
    var genie=document.getElementById('genie'); 
    genie.value = msg;
    genie.style.backgroundColor = "#efefff";
    genie.style.zIndex=110;
    setTimeout((()=>{var genie=document.getElementById('genie'); genie.value=''; genie.style.zIndex=-110;}),msec?msec:3000);
}

//+===================+
//+=== TASK Section =======+
//+===================+
// globals
var task={};
var TCB_S1={};
var TCB_M1={}; 
var TCB_M5={};
// usage
    // TCB_xxにtask_handlerを登録した後、TaskCreateする
     // TCB_M1['changeChart'] = task_changeChart;
     // if(task["task_M1"]==undefined)   TaskCreate(task_M1,  60000);
     // if(task["task_M5"]==undefined)   TaskCreate(task_M5, 300000);
     // if(task["task_S1"]==undefined)   TaskCreate(task_S1,   1000);
function task_S1()
{
     Object.keys(TCB_S1).forEach(key => TCB_S1[key]());     //TCB_S1に登録されたtaskを実行
}
function task_M1()
{
     Object.keys(TCB_M1).forEach(key => TCB_M1[key]());     //TCB_M1に登録されたtaskを実行
}
function task_M5()
{
     Object.keys(TCB_M5).forEach(key => TCB_M5[key]());     //TCB_M5に登録されたtaskを実行
}

//=============
//=== TASK Common    
//=============
//const sleep      = msec => new Promise(resolve => setTimeout(resolve, msec));
function TaskLoop(handler, step) {
  handler();
  task[handler.name] = setTimeout(TaskLoop, step, handler, step);
}

function TaskCreate(handler, step) {
  if (!task[handler.name]) {
    task[handler.name] = setTimeout(TaskLoop, step, handler, step);
  }
}

function TaskDelete(handler) {
  clearTimeout(task[handler.name]);
  task[handler.name] = null;
}

//+===================+
//+===   short cuts   =======+
//+===================+
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
    popupGenie( 'ショートカット一覧を、クリップボードにコピーしました', 5000);
    setClipB( buf );
}

async function speak(txt='', lang='', volume=1.0, rate=1.0, pitch=1.0) {
    if(txt.length>0) 	speakBuff.push(txt);
    while(speakBuff.length>0) {
            var uttr    = new SpeechSynthesisUtterance(); 
            uttr.text   = speakBuff.shift();
            uttr.lang   = lang  == ''? 'ja-JP' : lang;
            uttr.volume = volume== 0 ? 1.0     : volume;
            uttr.rate   = rate  == 0 ? 1.0     : rate;
            uttr.pitch  = pitch == 0 ? 1.0     : pitch;
            await speechSynthesis.speak(uttr);
    }
}
	
