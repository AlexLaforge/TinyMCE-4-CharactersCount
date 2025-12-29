// -  - - - - - - - - - - - - - - - - -
// TinyMCE 4 Characters Counter Plugin
// -  - - - - - - - - - - - - - - - - -
// Created by Le Juste Web
// https://lejusteweb.com
// -  - - - - - - - - - - - - - - - - -
// 2025-12-29 - v1.0.0
// -  - - - - - - - - - - - - - - - - -

//Load languages
tinymce.PluginManager.requireLangPack('characterscount');

//Register Plugin
tinymce.PluginManager.add('characterscount', function (editor, pluginUrl) {
  
  // Editor
  var ed = editor;
  
  // Debouncer
  var _ = tinymce.util.Tools.resolve("tinymce.util.Delay");

  // Settings getters
  function getSettBool(name, defV) {
    var v = ed.settings[name];
    if (v === undefined || v === null) return defV;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    return !!v;
  } //getSettBool

  function getSettStr(name, defV) {
    var v = ed.settings[name];
    if (v === undefined || v === null) return defV;
    if (typeof v === 'string') return v;
    return v;
  } //getSettStr

  function getSettNumb(name, defV) {
    var v = ed.settings[name];
    if (v === 0) return 0;
    var n = Number(v);
    return (isFinite(n) && n >= 0) ? n : defV;
  } //getSettNumb


  //Get Configration Settings
  var bTxt = getSettBool('characterscount_show_text', true);
  var bSrc = getSettBool('characterscount_show_source', true);
  var dl = getSettNumb('characterscount_debounce', 250);
  //var separator = getSettStr('characterscount_separator', ' | ');


  // End gracefully if no counter is needed (neither Source nor Text)
  function bSth() {
    return bTxt || bSrc;
  } //bSth


  // Normalizations
  function normEol(s) {
    return (s || '').replace(/\r\n/g, '\n');
  } //normEol


  function normPubTxt(s) {
    // Stabilize \r\n and transform NBSP in normal spaces for a more predictable count
    return normEol(s).replace(/\u00A0/g, ' ');
  } //normPubTxt


  function getCntTxt() {
    var text = normPubTxt(ed.getContent({ format: 'text' }));
    return text.length;
  } //getCntTxt


  function getCntSrc() {
    // Source = Serialized HTML (normalized by TinyMCE)
    var html = normEol(ed.getContent({ format: 'html' }));
    return html.length;
  } //getCntSrc


  //Return Status String (TEXT)
  function cntTxt() {
    if (!statusbar) return;

    var v = '';
    var sf = ed.translate('characterscount.label.text.suffix');
    var sfx = (sf ? ' ' + sf : '');

    if (!bSth()) {return;}

    if (bTxt) {
      //&#x2248;
      v = ed.translate('characterscount.label.text.prefix') + ' ≈ ' + getCntTxt() + sfx;
    }

    return v;

  } //cntTxt


  //Return Status String (SOURCE)
  function cntSrc() {
    if (!statusbar) return;

    var v = '';
    var sf = ed.translate('characterscount.label.source.suffix');
    var sfx = (sf ? ' ' + sf : '');

    if (!bSth()) {return;}

    if (bSrc) {
      //&#x2248;
      v = ed.translate('characterscount.label.source.prefix') + ' ≈ ' + getCntSrc() + sfx;
    }

    return v;

  } //cntSrc


  //Update Text in Status bar
  function upd() {
    if(bTxt){
      ed.theme.panel.find("#characterscount-text").text(cntTxt());
    }
    if(bSrc){
      ed.theme.panel.find("#characterscount-source").text(cntSrc());
    }
  } //upd


  ed.on('preinit', function () {

    var csslink = editor.dom.create('link', {
        rel: 'stylesheet',
        href: pluginUrl + "/css/ui.css"
    });
    document.getElementsByTagName('head')[0].appendChild(csslink);

  }); //editor.on('preinit


  ed.on('init', function () {
    var stBar = ed.theme && ed.theme.panel && ed.theme.panel.find ? ed.theme.panel.find("#statusbar")[0] : null;

    var n = _.debounce(upd, dl);

    if (!stBar) return;

    _.setEditorTimeout(ed, function() {
      if(bTxt){
        stBar.insert({
            type: "label",
            name: "characterscount-text",
            text: cntTxt(),
            classes: "characterscount",
            disabled: ed.settings.readonly
        }, 0);
      }
      if(bSrc){
        stBar.insert({
            type: "label",
            name: "characterscount-source",
            text: cntSrc(),
            classes: "characterscount",
            disabled: ed.settings.readonly
        }, 0);
      }
      ed.on("setcontent beforeaddundo undo redo keyup change paste", n);
    }, 0);

    //Refresh Once at startup
    n();

  }); //editor.on('init


  // Optional API
  return {
    getCounts: function () {
      return {
        text: getCntTxt(),
        source: getCntSrc()
      };
    }
  };
});
