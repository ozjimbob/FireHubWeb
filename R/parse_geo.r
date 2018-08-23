#!/usr/bin/Rscript

suppressMessages(require(tidyverse))
suppressMessages(require(sf))
suppressMessages(require(rjson))
library(pryr)
print(mem_used())
if("vapour" %in% rownames(installed.packages()) == FALSE) {
    library(devtools)
  install_github("hypertidy/vapour")
   }

library(vapour)

args = commandArgs(trailingOnly=TRUE)
root = args[1]

print(root)
#root = "G:/FireHub/UTAS-20180601T044937Z-001/UTAS/NTHI_APR2018/NTHI_APR2018/NTHI_APR2018"

shapefiles = list.files(root,pattern=".shp$",full.names=TRUE,ignore.case=TRUE)
geopackages = list.files(root,pattern=".gpkg$",full.names=TRUE,ignore.case=TRUE)
geofolders = list.dirs(root) %>% str_subset(".gdb$")

#print(geofolders)

flist = list()

idx = 1

for(i in geofolders){
    layer_list = vapour_layer_names(i)
  sl = list()
    sl$FilePath = str_replace(i,root,"")
    sl$FileType = "ESRI_Database"
      sl$Layers = list()
      for(j in 1:length(layer_list)){
            sl$Layers[[j]] = list()
 #           print(layer_list$name[j])
          sl$Layers[[j]]$LayerName = layer_list[j]
              
              FID = vapour_read_names(i,sl$Layers[[j]]$LayerName)[1]
              rf = vapour_read_attributes(i,sl$Layers[[j]]$LayerName,limit_n=1)
                  if(is.na(vapour_read_extent(i,sl$Layers[[j]])[[1]][1])){
                          type="Table"
                  }else{
                          type="Spatial"
                      }
                  print(rf)
                  sl$Layers[[j]]$Fields = names(rf)
                      sl$Layers[[j]]$Type = type
                    }
        flist[[idx]]=sl
          idx=idx+1
}



for(i in geopackages){
    layer_list = st_layers(i)
  sl = list()
    sl$FilePath = str_replace(i,root,"")
    sl$FileType = "Geopackage"
      sl$Layers = list()
      for(j in 1:length(layer_list$name)){
            sl$Layers[[j]] = list()
          sl$Layers[[j]]$LayerName = layer_list$name[j]
              
              
              FID = vapour_read_names(i,sl$Layers[[j]]$LayerName)[1]
              rf = vapour_read_attributes(i,sl$Layers[[j]]$LayerName,sql = paste0("select * from ",sl$Layers[[j]]$LayerName," where FID = ",FID,""))
                  if(is.na(layer_list$geomtype[1])){
                          type="Table"
                  }else{
                          type="Spatial"
                      }
                  
                  sl$Layers[[j]]$Fields = names(rf)
                      sl$Layers[[j]]$Type = type
                    }
        flist[[idx]]=sl
          idx=idx+1
}

for(i in geopackages){
    layer_list = st_layers(i)
  sl = list()
    sl$FilePath = str_replace(i,root,"")
    sl$FileType = "ESRI_Shapefile"
      sl$Layers = list()
      for(j in 1:length(layer_list$name)){
            sl$Layers[[j]] = list()
          sl$Layers[[j]]$LayerName = layer_list$name[j]
              
              
              FID = vapour_read_names(i,sl$Layers[[j]]$LayerName)[1]
              rf = vapour_read_attributes(i,sl$Layers[[j]]$LayerName,sql = paste0("select * from ",sl$Layers[[j]]$LayerName," where FID = ",FID,""))
                  if(is.na(layer_list$geomtype[1])){
                          type="Table"
                  }else{
                          type="Spatial"
                      }
                  
                  sl$Layers[[j]]$Fields = names(rf)
                      sl$Layers[[j]]$Type = type
                    }
        flist[[idx]]=sl
          idx=idx+1
}

cat(toJSON(flist))
