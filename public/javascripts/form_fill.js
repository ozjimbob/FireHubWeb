
function fillLayers(el,target_id,dtype){
  var idx = el.selectedIndex;
  var toadd = document.getElementById(target_id);
  while (toadd.firstChild) {
        toadd.removeChild(toadd.firstChild);
  }
  window.client_pack.contents[idx].Layers.forEach(function(element){
      if(element.Type==dtype){
        var option = document.createElement("option");
        option.text = element.LayerName;
        option.value = element.LayerName;
        option.selected = "true";
        toadd.add(option);
      }
  });
}

function fillFields(el,target_id,parent_id,blank,field_type,colour){
  
  var this_value = el.value;
  var parent_idx = document.getElementById(parent_id).selectedIndex;
  var toadd = document.getElementById(target_id);

  while(toadd.firstChild){
    toadd.removeChild(toadd.firstChild);
  }
  var this_idx =  window.client_pack.contents[parent_idx].Layers.findIndex(x => (x.LayerName == this_value));
  
    var field_list = window.client_pack.contents[parent_idx].Layers[this_idx];
    var ext = window.client_pack.contents[parent_idx].Layers[this_idx].Extent;
    var ext = [[ext[1],ext[0]],[ext[3],ext[2]]];

    window.rects.forEach(function(rect){if (rect.colour == colour){window.mymap.removeLayer(rect)}})

    myRect = L.rectangle(ext,{color:colour,weight:1}).bindPopup(this_value)
    console.log(myRect.color)
    myRect.colour = colour;
    myRect.addTo(window.mymap);
    window.rects.push(myRect)
    window.mymap.fitBounds(ext);

  var out=[];
  
  if(field_type=="String"){
    for(var i=0;i<field_list.DataType.length;i++){if(field_list.DataType[i]=="String"){out.push(field_list.Fields[i])}};
  }else{
    for(var i=0;i<field_list.DataType.length;i++){if(field_list.DataType[i]!="String"){out.push(field_list.Fields[i])}};
  }
  
  if(blank==1){
    var option = document.createElement("option");
    option.text="*NONE*";
    option.value="";
    toadd.add(option);
  };
  console.log(out);
  out.forEach(function(element){
    var option = document.createElement("option");
    option.text=element;
    option.value =element;
    toadd.add(option);
  })

}

function getYear(){
  (new Date()).getFullYear()
};

function fillValues(file,layer,field,target){
 var toadd = document.getElementById(target);

  while (toadd.firstChild) {
        toadd.removeChild(toadd.firstChild);
  }
  let the_req={file: file,
           layer: layer,
           field: field}
  fetch("/firetools/flistt",{
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(the_req)
  })
  .then((res) => res.json())
  .then((data) => {
    var ar = data.contents;
    console.log(ar);
    var option=document.createElement("option");
    option.text="";
    option.value = "";
    toadd.add(option);
    ar.forEach(function(element){
      var option = document.createElement("option");
      option.text = element;
      option.value = element;
      toadd.add(option);
    })
  }
      
      )
  .catch((err) => console.log(err))
}


function check(input) {
  console.log("checking");
          if (input.value != document.getElementById('i_pass1').value) {
            console.log("no match")
              input.setCustomValidity('Password Must be Matching.');
         } else {
         // input is valid -- reset the error message
        input.setCustomValidity('');
        console.log("match")
                }
 }



jQuery(function($){
$('#myModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var an_uuid = button.data('uuid') // Extract info from data-* attributes
    var the_url = button.data('url')
   // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    console.log(an_uuid)
    modal.find('#del_button').attr("href", the_url + an_uuid)
 })
})

