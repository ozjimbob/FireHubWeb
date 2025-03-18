#!/usr/bin/Rscript
library(dplyr)
library(tibble)
library(tidyselect)
library(sf)
#sf_use_s2(FALSE)
setwd("~/FireHubWeb/storage")
#https://datasets.seed.nsw.gov.au/dataset/1d05e145-80cb-4275-af9b-327a1536798d/resource/49075b91-8bcc-46e0-9cd9-2204aa61aeab/download/fire_npwsfirehistory.zip"
shp <- "https://datasets.seed.nsw.gov.au/dataset/1d05e145-80cb-4275-af9b-327a1536798d/resource/ba85f373-c360-4ca7-a081-f007127b73c9/download/fire_npwsfirehistory.zip"
download.file(shp,"fire.zip",mode="wb")
unzip("fire.zip",exdir="firehist")
unlink("fire.zip")
fhist <- read_sf("firehist/NPWSFireHistory.shp")
fhist$FireYear = substr(fhist$Label,1,4)
fhist$StartDate = as.character(fhist$StartDate)
fhist$EndDate= as.character(fhist$EndDate)
unlink("firehistory.gpkg")

print("Make Valid")
fhist <- st_make_valid(fhist)
print("Buffer")
fhist <- st_buffer(fhist,0)

fhist <- dplyr::select(fhist,FireYear)
write_sf(fhist,"firehistory.gpkg")
unlink("firehist",recursive = TRUE)

branch_list <- c("BMTN","GSYD","HCCO","NTHC","NTHI","STHC","STHR","WEST")
for(i in seq_along(branch_list)){
    br <- branch_list[i]
    print(br)
    this_branch <- read_sf(paste0("~/FireHubWeb/sched/",br,"/branch_",br,".gpkg"))
    fhist_t <- st_transform(fhist,st_crs(this_branch))
    br_fhist <- st_intersection(fhist_t,this_branch)
    br_fhist <- dplyr::select(br_fhist,"FireYear")
    unlink(paste0("~/FireHubWeb/sched/",br,"/firehist.gpkg"))
    write_sf(br_fhist,"test.gpkg")
    #write_sf(br_fhist,paste0("/mnt/volume_sgp1_02/storage/sched/",br,"/firehist.gpkg"))
    file.rename("test.gpkg",paste0("~/FireHubWeb/sched/",br,"/firehist.gpkg"))

    Sys.chmod(paste0("~/FireHubWeb/sched/",br,"/firehist.gpkg"), "777", use_umask = FALSE)
}