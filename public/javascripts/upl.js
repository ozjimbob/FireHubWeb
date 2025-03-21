function _(el) {
    return document.getElementById(el);
  }
  
  function uploadFile() {
    var file = _("file").files[0];
    console.log(file)
    var description = _("description").value;
    console.log(description)
    var name = _("name").value;
    console.log(name)
    var data_year = _("data_year").value;
    console.log(data_year)
    var description = _("private").value;
    console.log(file)

    // alert(file.name+" | "+file.size+" | "+file.type);
    var formdata = new FormData();
    formdata.append("file", file);
    formdata.append("description", description);
    formdata.append("name", name);
    formdata.append("data_year", data_year);
    formdata.append("private", private);

    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", progressHandler, false);
    ajax.addEventListener("load", completeHandler, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.addEventListener("abort", abortHandler, false);
    ajax.open("POST", "post_upload"); // http://www.developphp.com/video/JavaScript/File-Upload-Progress-Bar-Meter-Tutorial-Ajax-PHP
    //use file_upload_parser.php from above url
    ajax.send(formdata);
  }
  
  function progressHandler(event) {
    _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
    var percent = (event.loaded / event.total) * 100;
    _("progressBar").value = Math.round(percent);
    _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
  }
  
  function completeHandler(event) {
    _("status").innerHTML = event.target.responseText;
    _("progressBar").value = 0; //wil clear progress bar after successful upload
  }
  
  function errorHandler(event) {
    _("status").innerHTML = "Upload Failed" + event.type;
  }
  
  function abortHandler(event) {
    _("status").innerHTML = "Upload Aborted";
  }