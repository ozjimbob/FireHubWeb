function fillLayers(el,target_id){
  var idx = el.selectedIndex;
  var toadd = document.getElementById(target_id);
  while (toadd.firstChild) {
        toadd.removeChild(toadd.firstChild);
  }
  console.log(window.client_pack.contents[idx]);
  window.client_pack.contents[idx].Layers.forEach(function(element){
      var option = document.createElement("option");
      option.text = element.LayerName;
      option.value = element.LayerName;
      toadd.add(option);
  });
}

function fillFields(el,target_id,parent_id,blank,field_type){
  var this_idx = el.selectedIndex;
  var parent_idx = document.getElementById(parent_id).selectedIndex;
  var toadd = document.getElementById(target_id);

  while(toadd.firstChild){
    toadd.removeChild(toadd.firstChild);
  }
  console.log(window.client_pack.contents[parent_idx]);
  var field_list = window.client_pack.contents[parent_idx].Layers[this_idx];

  var out=[];
  console.log(field_list); i
  
  if(field_type=="String"){
    for(var i=0;i<field_list.DataType.length;i++){if(field_list.DataType[i]=="String"){out.push(field_list.Fields[i])}};
  }else{
    for(var i=0;i<field_list.DataType.length;i++){if(field_list.DataType[i]!="String"){out.push(field_list.Fields[i])}};
  }
  
  if(blank==1){
    var option = document.createElement("option");
    console.log("Inserting Blank")
    option.text="*NONE*";
    option.value="";
    toadd.add(option);
  };
  console.log(out);
  out.forEach(function(element){
    var option = document.createElement("option");
    console.log(element);
    option.text=element;
    option.value =element;
    toadd.add(option);
  })
  console.log(out);

}

function getYear(){
  (new Date()).getFullYear()
};

