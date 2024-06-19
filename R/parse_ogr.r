#!/usr/bin/Rscript

suppressMessages(require(tidyverse))
suppressMessages(require(sf))
suppressMessages(require(rjson))
suppressMessages(require(gdalUtils))


#library(vapour)
Sys.sleep(240)
args = commandArgs(trailingOnly=TRUE)
root = args[1]


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
                            textent = c(0,0,0,0)
                                }else{
                      type="Spatial"
                      ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                      textent = ifo[7]
                      textent = as.numeric(strsplit(textent,"\\(|\\)|\\,|\\ ")[[1]][c(3,5,9,11)])

                      gk = which(str_detect(ifo,"^Geometry Column"))
                      ifo = ifo[(gk+1):length(ifo)]
                      ifo_fn = str_split(ifo,":") %>% map_chr(first)
                      ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                }

              sl$Layers[[j]]$Fields = ifo_fn
                  sl$Layers[[j]]$DataType = ifo_fy
                  sl$Layers[[j]]$Type = type
                  sl$Layers[[j]]$Extent = textent
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
                ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                      gk = which(str_detect(ifo,"^FID Column"))
                      ifo = ifo[(gk+1):length(ifo)]
                      textent = c(0,0,0,0)
                            ifo_fn = str_split(ifo,":") %>% map_chr(first)
                            ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                }else{
                                        type="Spatial"
                                        ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                                        textent = ifo[7]
                                        gk = which(str_detect(ifo,"^Geometry Column"))
                                        textent =as.numeric(strsplit(textent,"\\(|\\)|\\,|\\ ")[[1]][c(3,5,9,11)])
                                        ifo = ifo[(gk+1):length(ifo)]
                                              ifo_fn = str_split(ifo,":") %>% map_chr(first)
                                              ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                                  }
              
               sl$Layers[[j]]$Fields = ifo_fn
              sl$Layers[[j]]$DataType = ifo_fy
                  sl$Layers[[j]]$Type = type
              sl$Layers[[j]]$Extent = textent
                }
        flist[[idx]]=sl
          idx=idx+1
}

for(i in shapefiles){
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
                ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                      gk = which(str_detect(ifo,"^FID Column"))
                      ifo = ifo[(gk+1):length(ifo)]
                            ifo_fn = str_split(ifo,":") %>% map_chr(first)
                            ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                            textent = c(0,0,0,0)
                                }else{
                                        type="Spatial"
                                        ifo = ogrinfo(i,layer_list$name[j],ro=TRUE,dialect="SQLITE",so=TRUE)
                                        textent=ifo[7]
                                        textent = as.numeric(strsplit(textent,"\\(|\\)|\\,|\\ ")[[1]][c(3,5,9,11)])

                                        gk = which(str_detect(ifo,"^Geometry Column"))
                                        ifo = ifo[(gk+1):length(ifo)]
                                              ifo_fn = str_split(ifo,":") %>% map_chr(first)
                                              ifo_fy = str_split(ifo,":") %>% map_chr(last) %>% word(2)
                                                  }
              
              sl$Layers[[j]]$Fields = ifo_fn
              sl$Layers[[j]]$DataType = ifo_fy
                  sl$Layers[[j]]$Type = type
              sl$Layers[[j]]$Extent = textent
                }
        flist[[idx]]=sl
          idx=idx+1
}
cat(toJSON(flist))

