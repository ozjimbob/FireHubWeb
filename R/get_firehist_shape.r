#!/usr/bin/Rscript
library(sf)
setwd("~/FireHubWeb/storage")
shp <- "https://datasets.seed.nsw.gov.au/dataset/1d05e145-80cb-4275-af9b-327a1536798d/resource/49075b91-8bcc-46e0-9cd9-2204aa61aeab/download/fire_npwsfirehistory.zip"

download.file(shp,"fire.zip",mode="wb")
unzip("fire.zip",exdir="firehist")
unlink("fire.zip")
fhist <- read_sf("firehist/NPWSFireHistory.shp")
fhist$FireYear = substr(fhist$Label,1,4)
fhist$StartDate = as.character(fhist$StartDate)
fhist$EndDate= as.character(fhist$EndDate)
unlink("firehistory.gpkg")
write_sf(fhist,"firehistory.gpkg")
unlink("firehist",recursive = TRUE)

