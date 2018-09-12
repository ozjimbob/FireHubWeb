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
        toadd.add(option);
      }
  });
}

function fillFields(el,target_id,parent_id,blank,field_type){
  var this_value = el.value;
  var parent_idx = document.getElementById(parent_id).selectedIndex;
  var toadd = document.getElementById(target_id);

  while(toadd.firstChild){
    toadd.removeChild(toadd.firstChild);
  }
  var this_idx =  window.client_pack.contents[parent_idx].Layers.findIndex(x => (x.LayerName == this_value));
  
  var field_list = window.client_pack.contents[parent_idx].Layers[this_idx]

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

