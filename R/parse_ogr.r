#!/usr/bin/Rscript

suppressMessages(require(tidyverse))
suppressMessages(require(sf))
suppressMessages(require(rjson))
suppressMessages(require(gdalUtils))


#library(vapour)

args = commandArgs(trailingOnly=TRUE)
root = args[1]

#root = "G:/FireHub/UTAS-20180601T044937Z-001/UTAS/NTHI_APR2018/NTHI_APR2018/NTHI_APR2018"

shapefiles = list.files(root,pattern=".shp$",full.names=TRUE,ignore.case=TRUE)
geopackages = list.files(root,pattern=".gpkg$",full.names=TRUE,ignore.case=TRUE)
geofolders = list.dirs(root) %>% str_subset(".gdb$")

flist = list()

idx = 1

for(i in geofolders){
    layer_list = st_layers(i)
  sl = list()
    sl$FilePath = str_replace(i,root,"")
    sl$FileType = "ESRI_Database"
      sl$Layers = list()
      for(j in 1:length(layer_list$name)){
            sl$Layers[[j]] = list()
          sl$Layers[[j]]$LayerName = layer_list$name[j]
              
            
              if(is.na(layer_list$geomtype[[j]][1])){
                      type="Table"
                ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                      gk = which(str_detect(ifo,"^FID Column"))
                      ifo = ifo[(gk+1):length(ifo)]
                            ifo_fn = str_split(ifo,":") %>% map_chr(first)
                            ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                }else{
                                        type="Spatial"
                                  ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                                        gk = which(str_detect(ifo,"^Geometry Column"))
                                        ifo = ifo[(gk+1):length(ifo)]
                                              ifo_fn = str_split(ifo,":") %>% map_chr(first)
                                              ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                                  }

              sl$Layers[[j]]$Fields = ifo_fn
                  sl$Layers[[j]]$DataType = ifo_fy
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
              
              
              
              if(is.na(layer_list$geomtype[[j]][1])){
                      type="Table"
                ifo = ogrinfo(i,layer_list$name[1],ro=TRUE,dialect="SQLITE",so=TRUE)
                      gk = which(str_detect(ifo,"^FID Column"))
                      ifo = ifo[(gk+1):length(ifo)]
                            ifo_fn = str_split(ifo,":") %>% map_chr(first)
                            ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                }else{
                                        type="Spatial"
                                  ifo = ogrinfo(i,layer_list$name[1],ro=TRUE,dialect="SQLITE",so=TRUE)
                                        gk = which(str_detect(ifo,"^Geometry Column"))
                                        ifo = ifo[(gk+1):length(ifo)]
                                              ifo_fn = str_split(ifo,":") %>% map_chr(first)
                                              ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
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
              
              
              if(is.na(layer_list$geomtype[[j]][1])){
                      type="Table"
                ifo = ogrinfo(i,layer_list$name[1],ro=TRUE,dialect="SQLITE",so=TRUE)
                      gk = which(str_detect(ifo,"^FID Column"))
                      ifo = ifo[(gk+1):length(ifo)]
                            ifo_fn = str_split(ifo,":") %>% map_chr(first)
                            ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                }else{
                                        type="Spatial"
                                  ifo = ogrinfo(i,layer_list$name[1],ro=TRUE,dialect="SQLITE",so=TRUE)
                                        gk = which(str_detect(ifo,"^Geometry Column"))
                                        ifo = ifo[(gk+1):length(ifo)]
                                              ifo_fn = str_split(ifo,":") %>% map_chr(first)
                                              ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                                  }
              
              sl$Layers[[j]]$Fields = names(rf)
                  sl$Layers[[j]]$Type = type
                }
        flist[[idx]]=sl
          idx=idx+1
}

cat(toJSON(flist))

