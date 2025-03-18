#!/usr/bin/Rscript
library(tidyverse)
library(terra)
setwd("/root/FireHubWeb/R")
branches = c("BMTN", "GSYD", "HCCO" ,"NTHC", "NTHI", "STHC", "STHR","WEST" )
mon = format(Sys.Date(),"%Y-%m")
print("Make Output Dir")
outdir = paste0("/root/FireHubWeb/output/SVTM_",mon)
print(outdir)
dir.create(outdir)



#v1 <- paste0("../output/",branches[1],"_",mon,"/output/v_heritage_threshold_status.gpkg")
#v2 <- paste0("../output/",branches[2],"_",mon,"/output/v_heritage_threshold_status.gpkg")
#v3 <- paste0("../output/",branches[3],"_",mon,"/output/v_heritage_threshold_status.gpkg")
#v4 <- paste0("../output/",branches[4],"_",mon,"/output/v_heritage_threshold_status.gpkg")
#v5 <- paste0("../output/",branches[5],"_",mon,"/output/v_heritage_threshold_status.gpkg")
#v6 <- paste0("../output/",branches[6],"_",mon,"/output/v_heritage_threshold_status.gpkg")
#v7 <- paste0("../output/",branches[7],"_",mon,"/output/v_heritage_threshold_status.gpkg")


#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v1))
#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v2))
#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v3))
#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v4))
#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v5))
#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v6))
#system(paste0("ogr2ogr -f 'gpkg' -append -nln SVTM_heritage ",outdir,"/SVTM_heritage.gpkg ",v7))

#unlink(paste0(outdir,"/SVTM_heritage.gpkg"))
print("Loading rasters")
r1 <- rast(paste0("../output/",branches[1],"_",mon,"/output/r_heritage_threshold_status.tif"))
r2 <- rast(paste0("../output/",branches[2],"_",mon,"/output/r_heritage_threshold_status.tif"))
r3 <- rast(paste0("../output/",branches[3],"_",mon,"/output/r_heritage_threshold_status.tif"))
r4 <- rast(paste0("../output/",branches[4],"_",mon,"/output/r_heritage_threshold_status.tif"))
r5 <- rast(paste0("../output/",branches[5],"_",mon,"/output/r_heritage_threshold_status.tif"))
r6 <- rast(paste0("../output/",branches[6],"_",mon,"/output/r_heritage_threshold_status.tif"))
r7 <- rast(paste0("../output/",branches[7],"_",mon,"/output/r_heritage_threshold_status.tif"))
r8 <- rast(paste0("../output/",branches[8],"_",mon,"/output/r_heritage_threshold_status.tif"))
print("merging rasters")
rcomb <- merge(r1,r2,r3,r4,r5,r6,r7,r8,filename=paste0(outdir,"/SVTM_heritage.tif"))
rm(rcomb)
gc()
print("Copying aux files")
file.copy(paste0("../output/",branches[1],"_",mon,"/output/r_heritage_threshold_status.tif.tmp.aux.xml"),
     paste0(outdir,"/SVTM_heritage.tif.tmp.aux.xml"),overwrite=TRUE)
file.copy(paste0("../output/",branches[1],"_",mon,"/output/r_heritage_threshold_status.tif.vat.dbf"),
     paste0(outdir,"/SVTM_heritage.tif.vat.dbf"),overwrite=TRUE)
file.copy(paste0("../output/",branches[1],"_",mon,"/output/r_heritage_threshold_status.tif.aux.xml"),
     paste0(outdir,"/SVTM_heritage.tif.aux.xml"),overwrite=TRUE)
print("Loading TSL Rasters")
r1 <- rast(paste0("../output/",branches[1],"_",mon,"/output/r_TimeSinceLast.tif"))
r2 <- rast(paste0("../output/",branches[2],"_",mon,"/output/r_TimeSinceLast.tif"))
r3 <- rast(paste0("../output/",branches[3],"_",mon,"/output/r_TimeSinceLast.tif"))
r4 <- rast(paste0("../output/",branches[4],"_",mon,"/output/r_TimeSinceLast.tif"))
r5 <- rast(paste0("../output/",branches[5],"_",mon,"/output/r_TimeSinceLast.tif"))
r6 <- rast(paste0("../output/",branches[6],"_",mon,"/output/r_TimeSinceLast.tif"))
r7 <- rast(paste0("../output/",branches[7],"_",mon,"/output/r_TimeSinceLast.tif"))
r8 <- rast(paste0("../output/",branches[8],"_",mon,"/output/r_TimeSinceLast.tif"))
print("Merging TSL rasters")
rcomb <- merge(r1,r2,r3,r4,r5,r6,r7,r8,filename=paste0(outdir,"/SVTM_TimeSinceLast.tif"))
rm(rcomb)
gc()
print("Loading NTB Rasters")
r1 <- rast(paste0("../output/",branches[1],"_",mon,"/output/r_NumTimesBurnt.tif"))
r2 <- rast(paste0("../output/",branches[2],"_",mon,"/output/r_NumTimesBurnt.tif"))
r3 <- rast(paste0("../output/",branches[3],"_",mon,"/output/r_NumTimesBurnt.tif"))
r4 <- rast(paste0("../output/",branches[4],"_",mon,"/output/r_NumTimesBurnt.tif"))
r5 <- rast(paste0("../output/",branches[5],"_",mon,"/output/r_NumTimesBurnt.tif"))
r6 <- rast(paste0("../output/",branches[6],"_",mon,"/output/r_NumTimesBurnt.tif"))
r7 <- rast(paste0("../output/",branches[7],"_",mon,"/output/r_NumTimesBurnt.tif"))
r8 <- rast(paste0("../output/",branches[8],"_",mon,"/output/r_NumTimesBurnt.tif"))
print("Merging NTB rasters")
rcomb <- merge(r1,r2,r3,r4,r5,r6,r7,r8,filename=paste0(outdir,"/SVTM_NumTimesBurnt.tif"))
rm(rcomb)
gc()
print("Loading Form Area tables")
t1 <- read_csv(paste0("../output/",branches[1],"_",mon,"/output/form_area_summary.csv"))
t2 <- read_csv(paste0("../output/",branches[2],"_",mon,"/output/form_area_summary.csv"))
t3 <- read_csv(paste0("../output/",branches[3],"_",mon,"/output/form_area_summary.csv"))
t4 <- read_csv(paste0("../output/",branches[4],"_",mon,"/output/form_area_summary.csv"))
t5 <- read_csv(paste0("../output/",branches[5],"_",mon,"/output/form_area_summary.csv"))
t6 <- read_csv(paste0("../output/",branches[6],"_",mon,"/output/form_area_summary.csv"))
t7 <- read_csv(paste0("../output/",branches[7],"_",mon,"/output/form_area_summary.csv"))
t8 <- read_csv(paste0("../output/",branches[8],"_",mon,"/output/form_area_summary.csv"))
print("Merging tables")
tall <-bind_rows(t1,t2,t3,t4,t5,t6,t7,t8)
print("Writing tables")
write_csv(tall,paste0(outdir,"/form_area_summary.csv"))


setwd(outdir)
print("Writing zip")
file2zip <- list.files()
zip(paste0("../SVTM_",mon,".zip"),file2zip)

setwd("/root/FireHubWeb/R")
# Delete old folders
print("Deleting output folders")
unlink(paste0(outdir,"/*"))
file.remove(paste0(outdir))

print("Deleting analysis folders")
for(branch in branches){
    this_outdir =paste0("/root/FireHubWeb/output/",branch,"_",mon)
    system(paste0("yes | rm -r ",this_outdir))
    #file.remove(paste0(this_outdir))
}

print("Connecting to database")
library(RPostgreSQL)
library(DBI)
source("../../rpg.r")


drv <- dbDriver("PostgreSQL")
# open the connection using user, passsword, etc., as
con <- dbConnect(drv, dbname = PGDATABASE,
 host = PGHOST,
 user = PGUSER,
 password = PGPASSWORD,
 port=PGPORT
)

#q = "select * from schedule"
#d = dbGetQuery(con,q)

#q = "
#CREATE TABLE schedule(
#id SERIAL PRIMARY KEY,
#name VARCHAR(255),
#type VARCHAR(255),
#created_at timestamptz DEFAULT NOW(),
#output_dir VARCHAR(255)
#);"

#d = dbGetQuery(con,q)
print("Making database table")
dbtbl <- tibble(name=paste0("SVTM Heritage Run - ",mon),
type="SVTM Statewide",
output_dir = paste0("SVTM_",mon,".zip"))
print("Writing to database")
dbWriteTable(con,"schedule",dbtbl,append=TRUE,row.names=FALSE)
print("Output Complate")