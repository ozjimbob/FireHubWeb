#!/usr/bin/Rscript

library(analogsea)
httr::set_config(httr::config(http_version = 0))

print("Parsing args")
# Retrieve command-line arguments
args = commandArgs(trailingOnly=TRUE)

# uuid name for the server
server_names = args[1]
server_names = strsplit(server_names,",")[[1]]

print("OAuth")
# Auth with DigitalOcean
invisible(do_oauth())

# Create droplet
print("Checking for dead instance")

dropnames = names(droplets())
tokill = server_names

print("Killing:")
print(tokill)

if(length(tokill) > 0){
for(i in tokill){
  if(i %in% c("airrater-01","tiles","NSWFireHub","firehub-web","heatwave","othertools","BMTN", "GSYD", "HCCO" ,"NTHC", "NTHI", "STHC", "STHR" ,"WEST")){
       next
  }
    dropnames = names(droplets())
    if(i %in% dropnames){
      print("Existing server for this analysis found - must be orphan. Deleting")
      id = which(dropnames == i)[1]
      to_delete = droplets()[[id]]
      if(to_delete$name %in% c("airrater-01","tiles","NSWFireHub","firehub-web","heatwave","othertools","BMTN", "GSYD", "HCCO" ,"NTHC", "NTHI", "STHC", "STHR" ,"WEST")){next}
      try({droplet_delete(to_delete)})
      Sys.sleep(15)
    }
  }  
}
